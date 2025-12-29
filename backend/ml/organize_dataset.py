# organize_dataset.py
"""
Utility script to clean and organize the dataset_raw folder.
- Flattens any sub‑directories inside each class folder.
- Moves image files (jpg, jpeg, png, gif) to the class root with unique names.
- Deletes non‑image files (e.g., .txt, .json, .DS_Store) and empty folders.
"""

from pathlib import Path
import shutil

# Path to the dataset root (relative to this script location)
OUTPUT_DIR = Path("../../dataset_raw")

# Allowed image extensions
IMG_EXTS = {".jpg", ".jpeg", ".png", ".gif"}

def clean_class_folder(class_dir: Path) -> None:
    """Flatten subfolders and remove unwanted files for a single class."""
    image_counter = 0
    # Process subdirectories
    for sub in list(class_dir.iterdir()):
        if sub.is_dir():
            for file in sub.rglob("*.*"):
                if file.suffix.lower() in IMG_EXTS:
                    # Create a unique filename in the class root
                    new_name = class_dir / f"{class_dir.name.replace(' ', '_')}_{image_counter:04d}{file.suffix.lower()}"
                    try:
                        shutil.move(str(file), str(new_name))
                        image_counter += 1
                    except Exception as e:
                        print(f"Error moving {file}: {e}")
                else:
                    # Delete non‑image file
                    try:
                        file.unlink()
                    except Exception as e:
                        print(f"Error deleting {file}: {e}")
            # Remove the now‑empty subdirectory
            try:
                sub.rmdir()
            except OSError:
                # Directory not empty (maybe hidden files); attempt recursive delete
                shutil.rmtree(sub, ignore_errors=True)
    # Clean up stray non‑image files directly in the class folder
    for file in list(class_dir.iterdir()):
        if file.is_file() and file.suffix.lower() not in IMG_EXTS:
            try:
                file.unlink()
            except Exception as e:
                print(f"Error deleting stray file {file}: {e}")

def main():
    if not OUTPUT_DIR.exists():
        print(f"Dataset directory {OUTPUT_DIR} does not exist.")
        return
    for class_dir in OUTPUT_DIR.iterdir():
        if class_dir.is_dir():
            print(f"Cleaning class folder: {class_dir.name}")
            clean_class_folder(class_dir)
    print("Dataset organization complete.")

if __name__ == "__main__":
    main()
