#!/usr/bin/env python3
"""Extract + compress ITR-1 portal screenshots from the intern Word guide.

Usage:
  python3 backend/scripts/extract_itr1_walkthrough_assets.py \\
    --docx "/path/to/How to file ITR-1.docx"

Requires macOS `sips` for JPEG compression (or leave PNGs if sips missing).
"""
from __future__ import annotations

import argparse
import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
DEFAULT_OUT = REPO / "frontend" / "public" / "portal" / "itr1"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--docx", required=True, type=Path)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--max-edge", type=int, default=1400)
    args = parser.parse_args()

    if not args.docx.is_file():
        raise SystemExit(f"Missing docx: {args.docx}")

    args.out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        with zipfile.ZipFile(args.docx) as zf:
            for name in zf.namelist():
                if name.startswith("word/media/image") and name.endswith(".png"):
                    zf.extract(name, tmp_path)
        media = sorted(
            (tmp_path / "word" / "media").glob("image*.png"),
            key=lambda p: int(p.stem.replace("image", "") or 0),
        )
        sips = shutil.which("sips")
        for src in media:
            dest_jpg = args.out / f"{src.stem}.jpg"
            if sips:
                subprocess.run(
                    [
                        sips,
                        "-s",
                        "format",
                        "jpeg",
                        "-Z",
                        str(args.max_edge),
                        str(src),
                        "--out",
                        str(dest_jpg),
                    ],
                    check=True,
                    capture_output=True,
                )
            else:
                shutil.copy2(src, args.out / src.name)
        print(f"Wrote {len(media)} assets to {args.out}")


if __name__ == "__main__":
    main()
