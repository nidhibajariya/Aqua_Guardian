"""
Gamification & Rewards System
Implements points, badges, achievements, and leaderboard functionality.
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime, timedelta
from db.supabase import supabase

router = APIRouter()

# Badge definitions
BADGES = {
    "first_report": {
        "name": "First Guardian",
        "description": "Submitted your first pollution report",
        "icon": "🌊",
        "points": 50
    },
    "reporter_5": {
        "name": "Active Reporter",
        "description": "Submitted 5 pollution reports",
        "icon": "📸",
        "points": 100
    },
    "reporter_25": {
        "name": "Pollution Hunter",
        "description": "Submitted 25 pollution reports",
        "icon": "🔍",
        "points": 500
    },
    "reporter_100": {
        "name": "Water Guardian Master",
        "description": "Submitted 100 pollution reports",
        "icon": "🏆",
        "points": 2000
    },
    "verified_report": {
        "name": "Verified Reporter",
        "description": "Had a report verified by authorities",
        "icon": "✅",
        "points": 75
    },
    "high_accuracy": {
        "name": "Eagle Eye",
        "description": "AI confidence >95% on 10 reports",
        "icon": "👁️",
        "points": 300
    },
    "cleanup_participant": {
        "name": "Cleanup Hero",
        "description": "Participated in a cleanup event",
        "icon": "🧹",
        "points": 200
    },
    "streak_7": {
        "name": "Weekly Warrior",
        "description": "Reported for 7 consecutive days",
        "icon": "🔥",
        "points": 250
    },
    "community_leader": {
        "name": "Community Leader",
        "description": "Top 10 on the leaderboard",
        "icon": "⭐",
        "points": 500
    }
}

# Points calculation
POINTS_CONFIG = {
    "report_submitted": 10,
    "report_verified": 25,
    "high_confidence_ai": 15,  # AI confidence > 90%
    "cleanup_completed": 50,
    "daily_streak_bonus": 5,
    "referral": 30
}

@router.get("/users/{user_id}")
def get_user_rewards(user_id: str):
    """Get user's complete reward profile."""
    try:
        # Get user's total points
        points_result = supabase.table("user_points").select("*").eq("user_id", user_id).execute()
        total_points = points_result.data[0]["total_points"] if points_result.data else 0
        
        # Get user's badges
        badges_result = supabase.table("user_badges").select("*").eq("user_id", user_id).execute()
        badges = badges_result.data if badges_result.data else []
        
        # Get user's achievements
        achievements = calculate_achievements(user_id)
        
        # Get user's rank
        rank = get_user_rank(user_id)
        
        return {
            "user_id": user_id,
            "total_points": total_points,
            "badges": badges,
            "achievements": achievements,
            "rank": rank,
            "level": calculate_level(total_points)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/award-points")
def award_points(user_id: str, action: str, amount: int = None):
    """Award points to a user for an action."""
    try:
        # Calculate points based on action
        points = amount if amount else POINTS_CONFIG.get(action, 0)
        
        # Get current points
        result = supabase.table("user_points").select("*").eq("user_id", user_id).execute()
        
        if result.data:
            # Update existing points
            current_points = result.data[0]["total_points"]
            new_points = current_points + points
            
            supabase.table("user_points").update({
                "total_points": new_points,
                "updated_at": datetime.now().isoformat()
            }).eq("user_id", user_id).execute()
        else:
            # Create new points record
            supabase.table("user_points").insert({
                "user_id": user_id,
                "total_points": points
            }).execute()
        
        # Log the transaction
        supabase.table("points_transactions").insert({
            "user_id": user_id,
            "action": action,
            "points": points,
            "timestamp": datetime.now().isoformat()
        }).execute()
        
        # Check for badge eligibility
        check_and_award_badges(user_id)
        
        return {"success": True, "points_awarded": points}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leaderboard")
def get_leaderboard(limit: int = 50, timeframe: str = "all_time"):
    """Get the leaderboard rankings."""
    try:
        # Get top users by points
        result = supabase.table("user_points").select("user_id, total_points").order("total_points", desc=True).limit(limit).execute()
        
        leaderboard = []
        for idx, user_data in enumerate(result.data, 1):
            # Get user details
            user_result = supabase.table("users").select("name, email").eq("id", user_data["user_id"]).execute()
            user_name = user_result.data[0]["name"] if user_result.data else "Anonymous"
            
            # Get user's report count
            reports_result = supabase.table("reports").select("id", count="exact").eq("user_id", user_data["user_id"]).execute()
            report_count = reports_result.count if reports_result.count else 0
            
            leaderboard.append({
                "rank": idx,
                "user_id": user_data["user_id"],
                "name": user_name,
                "points": user_data["total_points"],
                "reports": report_count,
                "level": calculate_level(user_data["total_points"])
            })
        
        return leaderboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/badges")
def get_all_badges():
    """Get all available badges."""
    return BADGES

@router.post("/award-badge")
def award_badge(user_id: str, badge_id: str):
    """Award a badge to a user."""
    try:
        if badge_id not in BADGES:
            raise HTTPException(status_code=400, detail="Invalid badge ID")
        
        # Check if user already has this badge
        existing = supabase.table("user_badges").select("*").eq("user_id", user_id).eq("badge_id", badge_id).execute()
        
        if existing.data:
            return {"success": False, "message": "User already has this badge"}
        
        # Award the badge
        badge_info = BADGES[badge_id]
        supabase.table("user_badges").insert({
            "user_id": user_id,
            "badge_id": badge_id,
            "name": badge_info["name"],
            "description": badge_info["description"],
            "icon": badge_info["icon"],
            "earned_at": datetime.now().isoformat()
        }).execute()
        
        # Award points for the badge
        award_points(user_id, f"badge_{badge_id}", badge_info["points"])
        
        return {"success": True, "badge": badge_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_level(points: int) -> int:
    """Calculate user level based on points."""
    # Level thresholds
    if points < 100:
        return 1
    elif points < 500:
        return 2
    elif points < 1000:
        return 3
    elif points < 2500:
        return 4
    elif points < 5000:
        return 5
    elif points < 10000:
        return 6
    else:
        return 7 + (points - 10000) // 5000

def calculate_achievements(user_id: str) -> Dict[str, Any]:
    """Calculate user's achievements."""
    try:
        # Get user's reports
        reports_result = supabase.table("reports").select("*").eq("user_id", user_id).execute()
        reports = reports_result.data if reports_result.data else []
        
        # Calculate statistics
        total_reports = len(reports)
        verified_reports = len([r for r in reports if r.get("status") == "verified"])
        high_confidence_reports = len([r for r in reports if r.get("ai_confidence", 0) > 0.9])
        
        return {
            "total_reports": total_reports,
            "verified_reports": verified_reports,
            "high_confidence_reports": high_confidence_reports,
            "completion_rate": (verified_reports / total_reports * 100) if total_reports > 0 else 0
        }
    except Exception as e:
        return {}

def get_user_rank(user_id: str) -> int:
    """Get user's rank on the leaderboard."""
    try:
        # Get all users ordered by points
        result = supabase.table("user_points").select("user_id, total_points").order("total_points", desc=True).execute()
        
        for idx, user_data in enumerate(result.data, 1):
            if user_data["user_id"] == user_id:
                return idx
        
        return 0
    except Exception as e:
        return 0

def check_and_award_badges(user_id: str):
    """Check if user is eligible for any badges and award them."""
    try:
        # Get user's report count
        reports_result = supabase.table("reports").select("*").eq("user_id", user_id).execute()
        reports = reports_result.data if reports_result.data else []
        report_count = len(reports)
        
        # Check for report count badges
        if report_count == 1:
            award_badge(user_id, "first_report")
        elif report_count == 5:
            award_badge(user_id, "reporter_5")
        elif report_count == 25:
            award_badge(user_id, "reporter_25")
        elif report_count == 100:
            award_badge(user_id, "reporter_100")
        
        # Check for verified report badge
        verified_reports = [r for r in reports if r.get("status") == "verified"]
        if len(verified_reports) >= 1:
            award_badge(user_id, "verified_report")
        
        # Check for high accuracy badge
        high_confidence_reports = [r for r in reports if r.get("ai_confidence", 0) > 0.95]
        if len(high_confidence_reports) >= 10:
            award_badge(user_id, "high_accuracy")
        
    except Exception as e:
        print(f"Error checking badges: {e}")
