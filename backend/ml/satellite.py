try:
    from .infer_satellite import analyze_location
    SATELLITE_AVAILABLE = True
except Exception as e:
    print(f"WARNING: Satellite processing not available: {e}")
    SATELLITE_AVAILABLE = False

def process_satellite_image(safe_path, lat=None, lon=None):
    """
    Main entry point for satellite image processing.
    """
    if not SATELLITE_AVAILABLE or not safe_path:
        # Return mock data if no path provided (for testing without data)
        return {
            "status": "No dataset provided or satellite processing unavailable",
            "hotspots": []
        }
        
    try:
        result = analyze_location(safe_path, lat, lon)
        return result
    except Exception as e:
        print(f"Error processing satellite image: {e}")
        return {"error": str(e)}
