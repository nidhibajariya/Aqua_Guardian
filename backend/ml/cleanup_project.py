# cleanup_project.py
"""
Utility to reorganize the AQUA‑Guardian repository:
- Move all *.md files into a `docs/` folder.
- Rename `dataset_raw/` → `data/dataset_raw/`.
- Delete temporary *.txt, *.bat, *.log files.
- (Optional) Move stray scripts into a `scripts/` folder.
Run once from the project root:
    python backend/ml/cleanup_project.py
"""

import shutil
from pathlib import Path

# Determine project root (two levels up from this script)
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# Target directories
DOCS_DIR = PROJECT_ROOT / "docs"
DATASET_DIR = PROJECT_ROOT / "data" / "dataset_raw"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"

# Ensure target directories exist
for d in (DOCS_DIR, DATASET_DIR.parent, SCRIPTS_DIR):
    d.mkdir(parents=True, exist_ok=True)

# 1️⃣ Move Markdown documentation
for md_file in PROJECT_ROOT.glob("*.md"):
    shutil.move(str(md_file), str(DOCS_DIR / md_file.name))

# 2️⃣ Relocate the raw dataset folder
old_dataset = PROJECT_ROOT / "dataset_raw"
if old_dataset.is_dir():
    shutil.move(str(old_dataset), str(DATASET_DIR))

# 3️⃣ Delete unwanted temporary files
unwanted_patterns = ["*.txt", "*.bat", "*.log"]
for pattern in unwanted_patterns:
    for f in PROJECT_ROOT.rglob(pattern):
        try:
            f.unlink()
        except Exception as e:
            print(f"Failed to delete {f}: {e}")

# 4️⃣ (Optional) Gather stray Python scripts into `scripts/`
for py_file in PROJECT_ROOT.rglob("*.py"):
    # Skip core package files (backend, frontend, docs, data, scripts)
    if py_file.parent.name not in {"backend", "frontend", "docs", "data", "scripts"}:
        try:
            shutil.move(str(py_file), str(SCRIPTS_DIR / py_file.name))
        except Exception:
            pass

print("\n✅ Project cleanup complete.")
print(f"Docs moved to: {DOCS_DIR}")
print(f"Dataset moved to: {DATASET_DIR}")
print("Removed *.txt, *.bat, *.log files.")
print(f"Other scripts moved to: {SCRIPTS_DIR}")
