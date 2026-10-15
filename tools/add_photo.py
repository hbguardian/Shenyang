#!/usr/bin/env python3
"""Add a machine photo to the app: python3 tools/add_photo.py <machine-id> <image-file>

Shrinks the photo (640px wide, JPEG) and stores it inside data/photos.json so
the app shows it offline. Machine ids are the "id" values in data/items.json
and data/us_items.json. Re-run build.py afterwards.
"""
import base64, io, json, pathlib, sys
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
PHOTOS = ROOT / "data" / "photos.json"

def main(mid, path):
    ids = {i["id"] for f in ("items.json", "us_items.json") for i in json.loads((ROOT / "data" / f).read_text())}
    if mid not in ids:
        raise SystemExit(f"unknown machine id {mid!r}; known: {', '.join(sorted(ids))}")
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    im.thumbnail((640, 640))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=72, optimize=True, progressive=True)
    photos = json.loads(PHOTOS.read_text()) if PHOTOS.exists() else {}
    photos[mid] = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    PHOTOS.write_text(json.dumps(photos, indent=1) + "\n")
    print(f"{mid}: {im.size[0]}x{im.size[1]}, {len(buf.getvalue())//1024} KB")

if __name__ == "__main__":
    main(*sys.argv[1:3])
