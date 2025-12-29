"""
Oil Spill Image Dataset Downloader for AQUA Guardian
Downloads oil spill pollution images from Bing Image Search
"""
from bing_image_downloader import downloader
from pathlib import Path
import time
import sys

# Fix Windows encoding issues
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Configuration
OUTPUT_DIR = Path("../../dataset_raw")
IMAGES_PER_QUERY = 200
ADULT_FILTER = "on"

# Search queries for oil spill only
SEARCH_QUERIES = {
    "oil spill": [
        "oil spill on water surface",
        "oil slick on ocean water",
        "petroleum pollution in water",
        "crude oil spill environmental",
        "oil contaminated water",
        "oil pollution water body",
        "rainbow sheen oil pollution",
        "oil spill cleanup water",
        "marine oil spill disaster",
        "oil contaminated river surface"
    ]
}

def download_images_for_class(class_name, queries):
    """Download images for oil spill class."""
    print(f"\n{'='*70}")
    print(f"DOWNLOADING: {class_name.upper()}")
    print(f"{'='*70}")
    
    class_dir = OUTPUT_DIR / class_name
    class_dir.mkdir(parents=True, exist_ok=True)
    
    total_downloaded = 0
    
    for i, query in enumerate(queries, 1):
        print(f"\n[{i}/{len(queries)}] Query: '{query}'")
        print(f"    Downloading {IMAGES_PER_QUERY} images...")
        
        try:
            # Download images using Bing
            downloader.download(
                query=query,
                limit=IMAGES_PER_QUERY,
                output_dir=str(class_dir),
                adult_filter_off=False,
                force_replace=False,
                timeout=15,
                verbose=False
            )
            
            # Count downloaded images in this query folder
            query_folder = class_dir / query
            if query_folder.exists():
                downloaded = len(list(query_folder.glob("*.jpg"))) + len(list(query_folder.glob("*.png")))
                total_downloaded += downloaded
                print(f"    >> Downloaded {downloaded} images")
            
            # Be nice to the server
            time.sleep(2)
            
        except Exception as e:
            print(f"    WARNING: Error: {e}")
            continue
    
    print(f"\n>> Total for {class_name}: ~{total_downloaded} images")
    return total_downloaded

def flatten_directory(class_name):
    """Move all images from subdirectories to main class folder."""
    print(f"\nOrganizing {class_name} folder...")
    
    class_dir = OUTPUT_DIR / class_name
    
    # Find all images in subdirectories
    image_count = 0
    for subdir in class_dir.iterdir():
        if subdir.is_dir():
            # Move all images from this subdirectory
            for img in subdir.glob("*.*"):
                if img.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif']:
                    # Create unique filename
                    new_name = class_dir / f"{class_name.replace(' ', '_')}_{image_count:04d}{img.suffix}"
                    try:
                        img.rename(new_name)
                        image_count += 1
                    except Exception as e:
                        print(f"Error moving {img.name}: {e}")
            
            # Remove empty subdirectory
            try:
                if subdir.exists() and not list(subdir.iterdir()):
                    subdir.rmdir()
            except:
                pass
    
    print(f"  >> Organized {image_count} images")

def main():
    """Main download orchestrator."""
    print("\n" + "="*70)
    print("AQUA GUARDIAN - OIL SPILL DATASET DOWNLOADER")
    print("="*70)
    print(f"Output Directory: {OUTPUT_DIR.absolute()}")
    print(f"Images per query: {IMAGES_PER_QUERY}")
    print(f"Total queries: {sum(len(v) for v in SEARCH_QUERIES.values())}")
    print(f"Expected total: ~{IMAGES_PER_QUERY * sum(len(v) for v in SEARCH_QUERIES.values())} images")
    print("="*70)
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Download oil spill images
    for class_name, queries in SEARCH_QUERIES.items():
        total = download_images_for_class(class_name, queries)
        
        # Organize the folder
        flatten_directory(class_name)
    
    # Final summary
    print("\n" + "="*70)
    print("OIL SPILL DOWNLOAD COMPLETE!")
    print("="*70)
    print(f"\nCheck: dataset_raw/oil spill/")
    print("\nNext: Run organize_dataset.py to prepare for training")
    print("="*70)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nDownload interrupted by user")
    except Exception as e:
        print(f"\n\nERROR: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure you installed: pip install bing-image-downloader")
        print("2. Check your internet connection")
        print("3. Try reducing IMAGES_PER_QUERY if downloads fail")
