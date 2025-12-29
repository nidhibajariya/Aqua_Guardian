from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from db.supabase import supabase
from datetime import datetime
from middleware.logging import logger
import traceback

router = APIRouter()

@router.get("/water-quality")
def get_water_quality():
    """
    Fetches the latest water quality reading from the database.
    Returns None if no readings exist.
    """
    try:
        # Get the most recent reading
        result = supabase.table("water_quality_readings").select("*").order("recorded_at", desc=True).limit(1).execute()
        
        if result.data and len(result.data) > 0:
            reading = result.data[0]
            return {
                "pH": float(reading["ph"]),
                "turbidity": float(reading["turbidity"]),
                "oxygen": float(reading["oxygen"]),
                "salinity": float(reading["salinity"]),
                "temperature": float(reading["temperature"])
            }
        else:
            # Return None when no readings exist - frontend will handle empty state
            return None
    except Exception as e:
        print(f"Error fetching water quality: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/water-quality")
def add_water_quality_reading(
    ph: float,
    turbidity: float,
    oxygen: float,
    salinity: float,
    temperature: float,
    location: str = "Default Monitoring Station",
    latitude: float = None,
    longitude: float = None
):
    """
    Adds a new water quality reading to the database.
    Useful for simulating sensor data or manual entry.
    """
    try:
        result = supabase.table("water_quality_readings").insert({
            "location": location,
            "latitude": latitude,
            "longitude": longitude,
            "ph": ph,
            "turbidity": turbidity,
            "oxygen": oxygen,
            "salinity": salinity,
            "temperature": temperature
        }).execute()
        
        return result.data[0] if result.data else {}
    except Exception as e:
        print(f"Error adding water quality reading: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/water-quality-history")
def get_water_quality_history(limit: int = 20):
    """
    Fetches historical water quality readings for chart visualization.
    Returns the most recent readings ordered by time.
    """
    try:
        result = supabase.table("water_quality_readings").select("*").order("recorded_at", desc=True).limit(limit).execute()
        
        if result.data:
            # Reverse to get chronological order (oldest to newest)
            readings = list(reversed(result.data))
            
            # Transform to chart-friendly format
            chart_data = []
            for reading in readings:
                # Format timestamp for display
                timestamp = reading["recorded_at"]
                # Extract time portion (HH:MM)
                time_str = timestamp.split("T")[1][:5] if "T" in timestamp else timestamp[:5]
                
                chart_data.append({
                    "time": time_str,
                    "pH": float(reading["ph"]),
                    "oxygen": float(reading["oxygen"]),
                    "turbidity": float(reading["turbidity"]),
                    "temperature": float(reading["temperature"]),
                    "salinity": float(reading["salinity"])
                })
            
            return chart_data
        else:
            # Return empty array if no data
            return []
    except Exception as e:
        print(f"Error fetching water quality history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/marine-impact")
def get_marine_impact():
    """
    Returns marine impact metrics.
    Returns empty array until real data is available.
    """
    # TODO: Calculate from real database metrics when available
    return []

@router.get("/success-stories")
def get_success_stories():
    """
    Fetches all success stories from the database.
    """
    try:
        result = supabase.table("success_stories").select("*").order("created_at", desc=False).execute()
        
        if result.data:
            # Transform database format to frontend format
            stories = []
            for story in result.data:
                stories.append({
                    "id": story["id"],
                    "title": story["title"],
                    "location": story["location"],
                    "timeframe": story["timeframe"],
                    "description": story["description"],
                    "image": story["image_url"],
                    "status": story["status"],
                    "impact": {
                        "waterQualityImproved": story["water_quality_improved"],
                        "speciesRecovered": story["species_recovered"],
                        "livesImpacted": story["lives_impacted"],
                        "pollutionReduced": story["pollution_reduced"]
                    },
                    "challenges": story["challenges"],
                    "solutions": story["solutions"],
                    "results": story["results"],
                    "stakeholders": story["stakeholders"]
                })
            return stories
        else:
            return []
    except Exception as e:
        print(f"Error fetching success stories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
def get_dashboard_stats():
    """
    Returns key dashboard statistics for pollution reporting app.
    """
    try:
        # Get total reports count efficiently
        reports_count_res = supabase.table("reports").select("id", count="exact").execute()
        total_reports = reports_count_res.count if reports_count_res.count else 0
        
        # Get unique users count from the users table instead of reports
        users_count_res = supabase.table("users").select("id", count="exact").execute()
        unique_users = users_count_res.count if users_count_res.count else 0
        
        # Get resolved reports count
        resolved_count_res = supabase.table("reports").select("id", count="exact").eq("status", "resolved").execute()
        resolved_count = resolved_count_res.count if resolved_count_res.count else 0
        
        # Get verified reports count
        verified_count_res = supabase.table("reports").select("id", count="exact").eq("status", "verified").execute()
        verified_count = verified_count_res.count if verified_count_res.count else 0
        
        avg_response_time = "2.4h" # Placeholder for now, could be calculated from history
        
        logger.info(f"Dashboard Stats: reports={total_reports}, users={unique_users}, resolved={resolved_count}, verified={verified_count}")
        
        return {
            "total_reports": total_reports,
            "active_users": unique_users,
            "resolved_reports": resolved_count,
            "verified_reports": verified_count,
            "avg_response_time": avg_response_time
        }
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}", exc_info=True)
        # Return fallback data
        return {
            "total_reports": 0,
            "active_users": 0,
            "resolved_reports": 0,
            "verified_reports": 0,
            "avg_response_time": "N/A"
        }

@router.get("/reports/timeline")
def get_reports_timeline(days: int = 30):
    """
    Returns daily report counts for the last N days.
    """
    try:
        from datetime import datetime, timedelta
        
        # Get reports from last N days
        cutoff_date = datetime.now() - timedelta(days=days)
        cutoff_str = cutoff_date.isoformat()
        
        reports_result = supabase.table("reports").select("created_at").gte("created_at", cutoff_str).execute()
        
        # Group by date
        date_counts = {}
        for report in reports_result.data:
            date_str = report["created_at"].split("T")[0]  # Get date part only
            date_counts[date_str] = date_counts.get(date_str, 0) + 1
        
        # Fill in missing dates with 0
        timeline = []
        for i in range(days):
            date = datetime.now() - timedelta(days=days-i-1)
            date_str = date.strftime("%Y-%m-%d")
            timeline.append({
                "date": date_str,
                "count": date_counts.get(date_str, 0)
            })
        
        return timeline
    except Exception as e:
        print(f"Error fetching reports timeline: {e}")
        return []

@router.get("/reports/by-type")
def get_reports_by_type():
    """
    Returns count of reports grouped by pollution type.
    """
    try:
        reports_result = supabase.table("reports").select("description").execute()
        
        # Improved categorization logic
        categories = {
            "Industrial": ["industrial", "factory", "discharge"],
            "Plastic": ["plastic", "bottle", "trash", "waste"],
            "Oil": ["oil", "spill", "leak", "grease"],
            "Sewage": ["sewage", "overflow", "drain", "stink"],
            "Chemical": ["chemical", "toxin", "poison"],
            "Agricultural": ["agricultural", "farm", "runoff"]
        }
        
        type_counts = {cat: 0 for cat in categories}
        type_counts["Other"] = 0
        
        for report in reports_result.data:
            desc = report["description"].lower()
            found = False
            for category, keywords in categories.items():
                if any(kw in desc for kw in keywords):
                    type_counts[category] += 1
                    found = True
                    break
            if not found:
                type_counts["Other"] += 1
        
        chart_data = [{"name": k, "value": v} for k, v in type_counts.items() if v > 0]
        logger.info(f"Reports by Type: {chart_data}")
        return chart_data
    except Exception as e:
        print(f"Error fetching reports by type: {e}")
        return []

@router.get("/reports/by-status")
def get_reports_by_status():
    """
    Returns count of reports grouped by status.
    """
    try:
        reports_result = supabase.table("reports").select("status").execute()
        
        status_counts = {
            "pending": 0,
            "investigating": 0,
            "resolved": 0,
            "verified": 0
        }
        
        for report in reports_result.data:
            status = report["status"].lower()
            if status in status_counts:
                status_counts[status] += 1
        
        # Convert to array format for charts
        status_data = [
            {"status": "Pending", "count": status_counts["pending"]},
            {"status": "Investigating", "count": status_counts["investigating"]},
            {"status": "Verified", "count": status_counts["verified"]},
            {"status": "Resolved", "count": status_counts["resolved"]}
        ]
        logger.info(f"Reports by Status: {status_data}")
        return status_data
    except Exception as e:
        print(f"Error fetching reports by status: {e}")
        return []

@router.get("/reports/geographic-heatmap")
def get_geographic_heatmap():
    """
    Returns geographic distribution of pollution reports with severity levels.
    Groups reports by location and calculates severity based on report density.
    """
    try:
        reports_result = supabase.table("reports").select("*").execute()
        
        # Group reports by location
        location_data = {}
        for report in reports_result.data:
            location = report.get("location", "Unknown")
            lat = report.get("latitude")
            lng = report.get("longitude")
            
            if location not in location_data:
                location_data[location] = {
                    "location": location,
                    "lat": lat if lat else 0,
                    "lng": lng if lng else 0,
                    "reports": 0,
                    "severity": 0
                }
            
            location_data[location]["reports"] += 1
        
        # Calculate severity based on report count (normalize to 0-100 scale)
        max_reports = max([data["reports"] for data in location_data.values()]) if location_data else 1
        
        heatmap_data = []
        for data in location_data.values():
            # Severity calculation: more reports = higher severity
            severity = min(100, int((data["reports"] / max_reports) * 100))
            heatmap_data.append({
                "location": data["location"],
                "lat": data["lat"],
                "lng": data["lng"],
                "reports": data["reports"],
                "severity": severity
            })
        
        # Sort by severity (highest first)
        heatmap_data.sort(key=lambda x: x["severity"], reverse=True)
        
        return heatmap_data
    except Exception as e:
        print(f"Error fetching geographic heatmap: {e}")
        return []

@router.get("/reports/severity-distribution")
def get_severity_distribution():
    """
    Returns distribution of reports by severity level.
    Calculates severity based on pollution type and status.
    """
    try:
        reports_result = supabase.table("reports").select("description, status").execute()
        
        severity_counts = {
            "Critical": 0,
            "High": 0,
            "Medium": 0,
            "Low": 0
        }
        
        # Define severity mapping for pollution types
        critical_types = ["Oil Spill", "Chemical Contamination", "Industrial Discharge"]
        high_types = ["Sewage Overflow", "Plastic Pollution"]
        medium_types = ["Agricultural Runoff"]
        
        for report in reports_result.data:
            desc = report.get("description", "")
            status = report.get("status", "").lower()
            
            # Determine severity based on pollution type
            severity = "Low"
            for pollution_type in critical_types:
                if pollution_type in desc:
                    severity = "Critical"
                    break
            
            if severity == "Low":
                for pollution_type in high_types:
                    if pollution_type in desc:
                        severity = "High"
                        break
            
            if severity == "Low":
                for pollution_type in medium_types:
                    if pollution_type in desc:
                        severity = "Medium"
                        break
            
            # Increase severity if status is pending (unresolved)
            if status == "pending" and severity == "Low":
                severity = "Medium"
            
            severity_counts[severity] += 1
        
        # Convert to chart format
        return [
            {"name": "Critical", "value": severity_counts["Critical"], "fill": "#ef4444"},
            {"name": "High", "value": severity_counts["High"], "fill": "#f59e0b"},
            {"name": "Medium", "value": severity_counts["Medium"], "fill": "#eab308"},
            {"name": "Low", "value": severity_counts["Low"], "fill": "#10b981"}
        ]
    except Exception as e:
        print(f"Error fetching severity distribution: {e}")
        return []

@router.get("/reports/trend-comparison")
def get_trend_comparison(months: int = 6):
    """
    Returns trend data comparing reports, resolutions, and response times over months.
    """
    try:
        from datetime import datetime, timedelta
        
        # Get reports from last N months
        cutoff_date = datetime.now() - timedelta(days=months * 30)
        cutoff_str = cutoff_date.isoformat()
        
        reports_result = supabase.table("reports").select("created_at, status").gte("created_at", cutoff_str).execute()
        
        # Group by month
        monthly_data = {}
        for report in reports_result.data:
            created_at = report["created_at"]
            # Extract year-month
            date_obj = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            month_key = date_obj.strftime("%b")
            
            if month_key not in monthly_data:
                monthly_data[month_key] = {
                    "month": month_key,
                    "reports": 0,
                    "resolved": 0,
                    "avgResponseTime": None  # TODO: Calculate from real timestamps
                }
            
            monthly_data[month_key]["reports"] += 1
            if report["status"].lower() == "resolved":
                monthly_data[month_key]["resolved"] += 1
        
        # Convert to array and sort by month
        trend_data = list(monthly_data.values())
        
        return trend_data
    except Exception as e:
        print(f"Error fetching trend comparison: {e}")
        return []

@router.get("/marine-impact/metrics")
def get_marine_impact_metrics():
    """
    Returns marine impact metrics including species data and pollution sources.
    Returns empty object until real data is available.
    """
    try:
        # TODO: Calculate real marine impact metrics from database
        # For now, return empty structure
        return {
            "species_impact": [],
            "pollution_sources": [],
            "ecosystem_health": {},
            "ai_predictions": []
        }
    except Exception as e:
        print(f"Error fetching marine impact metrics: {e}")
        return {
            "species_impact": [],
            "pollution_sources": [],
            "ecosystem_health": {},
            "ai_predictions": []
        }

