from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks, Form
from typing import List, Optional

from db.supabase import supabase
from db.models import Report, ReportCreate
from ml.infer import predict_image
from blockchain.write_hash import generate_hash, write_hash_to_chain, generate_location_hash
from utils.storage import upload_file, get_public_url
from utils.notify import notify_authorities

router = APIRouter()

from datetime import datetime
import traceback
import sys

from middleware.logging import logger

def log_debug(msg):
    logger.debug(msg)

from fastapi import Depends
from fastapi.concurrency import run_in_threadpool
from api.deps import get_current_user

@router.post("/", response_model=Report)
async def create_report(
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user), # Securely get user from token
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: str = Form(...),
    severity: int = Form(...),
    file: UploadFile = File(...)
) -> Report:
    logger.info("RECEIVED POST /reports/")
    user_id = user['id'] # Extract ID from verified token
    logger.info(f"Report Request Authenticated - User: {user_id}, Desc: {description}")

    """Create a new pollution report.

    Handles mandatory image upload, AI inference, stores the report in Supabase,
    and logs the report hash to the blockchain as a background task.
    """
    # 1. Process image upload and AI inference
    photo_url: Optional[str] = None
    ai_result = {"class": None, "confidence": 0.0}
    
    file_bytes = await file.read()
    # Use the user ID from the report for a unique filename
    file_name = f"{user_id}_{file.filename}"
    if upload_file(file_bytes, file_name):
        photo_url = get_public_url(file_name)
    
    try:
        # Run heavy ML inference in a separate thread to avoid blocking the event loop
        ai_result = await run_in_threadpool(predict_image, file_bytes, description=description)
    except Exception as e:
        logger.error(f"AI Inference failed: {e}", exc_info=True)

    # 2. Build the report payload for Supabase
    # New Lifecycle: Submitted -> Verified by AI -> Sent to authorities -> Action in progress -> Action completed
    status = "Verified by AI" if ai_result["confidence"] >= 0.85 else "Submitted"

    report_payload = {
        "user_id": user_id,
        "latitude": latitude,
        "longitude": longitude,
        "description": description,
        "severity": severity,
        "ai_class": ai_result["class"],
        "ai_confidence": ai_result["confidence"],
        "status": status,
        "updated_at": datetime.utcnow().isoformat()
    }

    # 3. Insert the report into Supabase
    try:
        res = supabase.table("reports").insert(report_payload).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Database insert failed")
        new_report = res.data[0]
        
        # Insert photo reference to photos table
        if photo_url:
            supabase.table("photos").insert({"report_id": new_report["id"], "url": photo_url}).execute()
            # Manually add photo_url to the response object since it's not in the reports table
            new_report["photo_url"] = photo_url
            
        # 4. Log to blockchain asynchronously
        background_tasks.add_task(log_report_to_blockchain, new_report)
        
        # 5. Notify authorities if high-confidence pollution detected
        if ai_result["confidence"] >= 0.90:
            background_tasks.add_task(notify_authorities, new_report)
        
        return new_report
    except Exception as e:
        logger.error(f"Error creating report: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

def log_report_to_blockchain(report_data: dict) -> None:
    """Generate metadata and write to the blockchain.

    Runs as a background task to avoid blocking the API response.
    """
    try:
        # Extract metadata
        report_id = str(report_data["id"])
        ai_decision = report_data.get("ai_class") or "unknown"
        reviewer_decision = report_data.get("status") or "pending"
        
        # Generate hashes
        report_hash = generate_hash(report_data)
        location_hash = generate_location_hash(
            report_data.get("latitude", 0.0), 
            report_data.get("longitude", 0.0)
        )
        
        # Write to chain
        tx_hash = write_hash_to_chain(
            report_hash,
            report_id,
            ai_decision,
            reviewer_decision,
            location_hash
        )
        
        if tx_hash and tx_hash.startswith("0x"):
            supabase.table("blockchain_logs").insert({"report_id": report_data["id"], "tx_hash": tx_hash}).execute()
            logger.info(f"Blockchain record created for report {report_id}. Tx: {tx_hash}")
            
    except Exception as bc_e:
        logger.error(f"Blockchain logging failed (background): {bc_e}", exc_info=True)

@router.get("/", response_model=List[Report])
def get_reports() -> List[Report]:
    """Retrieve all reports."""
    res = supabase.table("reports").select("*").execute()
    return res.data

@router.get("/user/{user_id}", response_model=List[Report])
def get_user_reports(user_id: str):
    """Retrieve all reports submitted by a specific user."""
    logger.info(f"Entering get_user_reports for user {user_id}")
    try:
        res = supabase.table("reports").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        logger.info(f"Found {len(res.data) if res.data else 0} reports for user {user_id}")
        return res.data
    except Exception as e:
        logger.error(f"ERROR in get_user_reports: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/count/{user_id}")
def get_user_report_count(user_id: str):
    """Get the total number of reports submitted by a specific user."""
    try:
        res = supabase.table("reports").select("id", count="exact").eq("user_id", user_id).execute()
        return {"count": res.count if res.count else 0}
    except Exception as e:
        logger.error(f"Error fetching report count for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{report_id}", response_model=Report)
def get_report(report_id: str) -> Report:
    """Retrieve a single report by its ID."""
    res = supabase.table("reports").select("*").eq("id", report_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return res.data[0]

@router.post("/{report_id}/status")
def update_report_status(report_id: str, status: str = Form(...), action_note: str = Form(None)) -> dict:
    """Update the status of a report and add an optional action note."""
    logger.info(f"Status Update - Report: {report_id}, Status: {status}")
    
    update_payload = {
        "status": status,
        "updated_at": datetime.utcnow().isoformat()
    }
    if action_note:
        update_payload["action_note"] = action_note
        
    try:
        res = supabase.table("reports").update(update_payload).eq("id", report_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Report not found")
            
        updated_report = res.data[0]
        
        # Trigger notification
        message = f"Your report status has been updated to: {status}"
        if action_note:
            message += f". Note: {action_note}"
            
        from utils.notify import send_notification
        send_notification(updated_report["user_id"], message)
        
        return updated_report
    except Exception as e:
        logger.error(f"Error updating report status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{report_id}/verify")
def verify_report(report_id: str) -> List[dict]:
    """Mark a report as verified (admin/NGO action)."""
    # Legacy: Still functional but maps to new flow
    return update_report_status(report_id, status="Verified by AI")
