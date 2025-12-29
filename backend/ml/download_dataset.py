# """
# Automated Image Dataset Downloader for AQUA Guardian
# Downloads pollution images from Bing Image Search
# Windows-compatible version (no emojis)
# """

from bing_image_downloader import downloader
from pathlib import Path
import time

# Configuration
OUTPUT_DIR = Path("../../dataset_raw")  # Use existing dataset_raw at project root
IMAGES_PER_QUERY = 200  # Increased per query for larger download
ADULT_FILTER = "on"  # Filter adult content
TIMEOUT_SECONDS = 30  # Increased timeout for slower connections

# Search queries for each pollution class
# NOTE: Only downloading sewage and oil_spill (missing data)
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
        "oil contaminated river surface",
    ]
}


def download_images_for_class(class_name, queries):
    """Download images for a specific pollution class."""
    print(f"\n{'='*70}")
    print(f"DOWNLOADING: {class_name.upper()}")
    print(f"{'='*70}\n")

    class_dir = OUTPUT_DIR / class_name
    class_dir.mkdir(parents=True, exist_ok=True)
    total_downloaded = 0

    for i, query in enumerate(queries, 1):
        print(f"\n[{i}/{len(queries)}] Query: '{query}'")
        print(f"    Downloading {IMAGES_PER_QUERY} images...")
        try:
            downloader.download(
                query=query,
                limit=IMAGES_PER_QUERY,
                output_dir=str(class_dir),
                adult_filter_off=False,
                force_replace=False,
                timeout=TIMEOUT_SECONDS,
                verbose=False,
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
    image_count = 0
    for subdir in class_dir.iterdir():
        if subdir.is_dir():
            for img in subdir.glob("*.*"):
                if img.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif']:
                    new_name = class_dir / f"{class_name.replace(' ', '_')}_{image_count:04d}{img.suffix}"
                    try:
                        img.rename(new_name)
                        image_count += 1
                    except Exception as e:
                        print(f"Error moving {img.name}: {e}")
            try:
                if subdir.exists() and not list(subdir.iterdir()):
                    subdir.rmdir()
            except:
                pass
    print(f"  >> Organized {image_count} images")


def main():
    """Main download orchestrator."""
    print("\n" + "="*70)
    print("AQUA GUARDIAN - AUTOMATED DATASET DOWNLOADER")
    print("="*70)
    print(f"Output Directory: {OUTPUT_DIR.absolute()}")
    print(f"Images per query: {IMAGES_PER_QUERY}")
    print(f"Total queries: {sum(len(v) for v in SEARCH_QUERIES.values())}")
    print(f"Expected total: ~{IMAGES_PER_QUERY * sum(len(v) for v in SEARCH_QUERIES.values())} images")
    print("="*70)

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    grand_total = 0
    class_totals = {}
    for class_name, queries in SEARCH_QUERIES.items():
        total = download_images_for_class(class_name, queries)
        class_totals[class_name] = total
        grand_total += total
        flatten_directory(class_name)
        time.sleep(3)

    print("\n" + "="*70)
    print("DOWNLOAD COMPLETE!")
    print("="*70)
    print("\nSUMMARY:")
    for class_name, total in class_totals.items():
        status = "[OK]" if total >= 500 else "[WARN]"
        print(f"  {status} {class_name:12s} ~{total:4d} images")
    print(f"\n  TOTAL: ~{grand_total} images")
    print("\n" + "="*70)
    print("NEXT STEPS:")
    print("="*70)
    print("1. Review downloaded images in dataset_raw/")
    print("2. Remove any irrelevant/corrupted images (optional)")
    print("3. Run organization script:")
    print("   python backend\\ml\\organize_dataset.py")
    print("4. Start training:")
    print("   python backend\\ml\\train_v2.py")
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
