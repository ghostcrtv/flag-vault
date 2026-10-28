# Renders the SVG icons to PNG with a headless browser (pip install playwright).
from playwright.sync_api import sync_playwright
import pathlib, subprocess
root = pathlib.Path(__file__).resolve().parent.parent / "icons"
jobs = [("icon.svg", "apple-touch-icon.png", 180), ("icon.svg", "icon-192.png", 192), ("icon.svg", "icon-512.png", 512),
        ("icon.svg", "icon-1024.png", 1024), ("icon-maskable.svg", "icon-512-maskable.png", 512)]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1024, "height": 1024})
    for src, out, size in jobs:
        pg.goto((root / src).as_uri())
        full = root / f"_tmp_{out}"
        pg.screenshot(path=str(full))
        subprocess.run(["convert", str(full), "-resize", f"{size}x{size}", "-strip", str(root / out)], check=True)
        full.unlink()
    b.close()
print("icons rendered")
