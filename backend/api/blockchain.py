from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from blockchain.contract_interface import log_report, verify_report, get_report, report_exists

router = APIRouter()

class LogReportRequest(BaseModel):
    report_hash: str  # hex string starting with 0x

class VerifyReportRequest(BaseModel):
    report_id: int

@router.post("/log", tags=["Blockchain"])
def log_report_endpoint(req: LogReportRequest):
    try:
        report_id, tx_hash = log_report(req.report_hash)
        return {"report_id": report_id, "tx_hash": tx_hash}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify", tags=["Blockchain"])
def verify_report_endpoint(req: VerifyReportRequest):
    try:
        verify_report(req.report_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/report/{report_id}", tags=["Blockchain"])
def get_report_endpoint(report_id: int):
    try:
        return get_report(report_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/hash_exists/{report_hash}", tags=["Blockchain"])
def hash_exists_endpoint(report_hash: str):
    try:
        exists, report_id = report_exists(report_hash)
        return {"exists": exists, "report_id": report_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
