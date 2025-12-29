from fastapi import APIRouter, HTTPException, Form
from db.supabase import supabase
from datetime import datetime
import random

router = APIRouter()

@router.get("/water-bodies")
def get_water_bodies():
    """Fetch the catalog of water bodies available for adoption."""
    res = supabase.table("water_bodies").select("*").execute()
    return res.data

@router.post("/adopt")
def adopt_water_body(
    user_id: str = Form(...),
    water_body_id: str = Form(...),
    pledge_text: str = Form(...)
):
    """Process an adoption request, make a pledge, and 'mint' a mock NFT."""
    # 1. Check if already adopted by this user (unique constraint will catch it too)
    existing = supabase.table("adoptions").select("*").eq("user_id", user_id).eq("water_body_id", water_body_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="You have already adopted this water body.")

    # 2. Simulate NFT Minting
    token_id = random.randint(1000, 9999)
    tx_hash = f"0x{random.token_hex(32)}" if hasattr(random, 'token_hex') else f"0x{''.join(random.choices('0123456789abcdef', k=64))}"
    cert_url = f"https://aqua-guardian.io/certificates/nft-{token_id}.pdf" # Mock URL

    # 3. Store in DB
    try:
        res = supabase.table("adoptions").insert({
            "user_id": user_id,
            "water_body_id": water_body_id,
            "pledge_text": pledge_text,
            "nft_token_id": token_id,
            "blockchain_tx": tx_hash,
            "certificate_url": cert_url,
            "status": "active"
        }).execute()
        
        # Award points for adoption
        from api.rewards import award_points
        try:
            award_points(user_id, "water_adoption", 1000)
        except:
            pass # Gamification optional

        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{water_body_id}")
def get_water_body_impact(water_body_id: str):
    """Get the live impact stats (reports & cleanups) for a specific water body."""
    # Fetch reports linked to this water body
    reports_res = supabase.table("reports").select("*").eq("water_body_id", water_body_id).execute()
    
    # Fetch cleanups linked to this water body
    cleanups_res = supabase.table("cleanup_actions").select("*").eq("water_body_id", water_body_id).execute()
    
    # Fetch current adoptions
    adoptions_res = supabase.table("adoptions").select("*").eq("water_body_id", water_body_id).execute()
    print(f"DEBUG: Found {len(adoptions_res.data)} adoptions for water_body_id {water_body_id}")
    
    # Manually attach user names
    active_guardians = []
    for adoption in adoptions_res.data:
        user_res = supabase.table("users").select("name").eq("id", adoption["user_id"]).execute()
        user_name = user_res.data[0]["name"] if user_res.data else "Anonymous Guardian"
        active_guardians.append({
            **adoption,
            "users": {"name": user_name}
        })

    return {
        "reports_count": len(reports_res.data),
        "cleanups_count": len(cleanups_res.data),
        "active_guardians": active_guardians,
        "recent_reports": reports_res.data[:5],
        "recent_cleanups": cleanups_res.data[:5]
    }
