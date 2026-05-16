import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple


ROOT = Path(__file__).resolve().parents[1]
PHOTO_ROOT = ROOT / "assets" / "photo-albums"
OUTPUT_DIR = ROOT / "graphify-out"
INDEX_FILE = OUTPUT_DIR / "photo-albums-index.json"
CHANGES_FILE = OUTPUT_DIR / "photo-albums-changes.json"
CHANGES_MARKDOWN = OUTPUT_DIR / "PHOTO_ALBUM_CHANGES.md"
IGNORED_DIRS = {"_incoming", "__pycache__"}
IGNORED_FILES = {"desktop.ini"}
ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".bmp",
    ".mp4",
    ".mov",
    ".webm",
    ".m4v",
    ".ogv",
}


def iso_utc(timestamp: float) -> str:
    return (
        datetime.fromtimestamp(timestamp, tz=timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z")
    )


def load_family_index() -> Dict:
    family_file = ROOT / "data" / "family.js"
    text = family_file.read_text(encoding="utf-8")
    prefix = "window.FAMILY = "
    if not text.startswith(prefix):
        raise ValueError(f"Unexpected family.js format: {family_file}")
    return json.loads(text[len(prefix):].rstrip().rstrip(";"))


def ensure_album_directories() -> List[str]:
    family_index = load_family_index()
    person_ids = sorted(family_index.get("people", {}).keys())
    created: List[str] = []

    PHOTO_ROOT.mkdir(parents=True, exist_ok=True)

    for person_id in person_ids:
        person_dir = PHOTO_ROOT / person_id
        if not person_dir.exists():
            person_dir.mkdir(parents=True, exist_ok=True)
            created.append(person_id)

        if not any(person_dir.iterdir()):
            gitkeep = person_dir / ".gitkeep"
            if not gitkeep.exists():
                gitkeep.write_text("", encoding="utf-8")

    return created


def scan_photo_root() -> Dict:
    albums: List[Dict] = []

    for person_dir in sorted(PHOTO_ROOT.iterdir(), key=lambda item: item.name.lower()):
        if not person_dir.is_dir() or person_dir.name in IGNORED_DIRS:
            continue

        files: List[Dict] = []
        for path in sorted(person_dir.rglob("*"), key=lambda item: str(item).lower()):
            if not path.is_file():
                continue
            if path.name in IGNORED_FILES:
                continue
            if path.suffix.lower() not in ALLOWED_EXTENSIONS:
                continue

            stat = path.stat()
            relative = path.relative_to(ROOT).as_posix()
            files.append(
                {
                    "path": relative,
                    "name": path.name,
                    "size": stat.st_size,
                    "modifiedUtc": iso_utc(stat.st_mtime),
                }
            )

        albums.append(
            {
                "personId": person_dir.name,
                "fileCount": len(files),
                "files": files,
            }
        )

    return {
        "generatedAtUtc": iso_utc(datetime.now(tz=timezone.utc).timestamp()),
        "photoRoot": PHOTO_ROOT.relative_to(ROOT).as_posix(),
        "albumCount": len(albums),
        "albums": albums,
    }


def load_json(path: Path):
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def album_map(index_data: Dict) -> Dict[str, Dict[str, Dict]]:
    result: Dict[str, Dict[str, Dict]] = {}
    for album in index_data.get("albums", []):
        result[album["personId"]] = {entry["path"]: entry for entry in album.get("files", [])}
    return result


def diff_indexes(previous: Dict | None, current: Dict) -> Dict:
    previous_map = album_map(previous or {"albums": []})
    current_map = album_map(current)
    all_person_ids = sorted(set(previous_map) | set(current_map))
    albums_changed: List[Dict] = []

    for person_id in all_person_ids:
        previous_files = previous_map.get(person_id, {})
        current_files = current_map.get(person_id, {})

        added = [
            current_files[path]
            for path in sorted(set(current_files) - set(previous_files))
        ]
        removed = [
            previous_files[path]
            for path in sorted(set(previous_files) - set(current_files))
        ]

        modified = []
        for path in sorted(set(current_files) & set(previous_files)):
            before = previous_files[path]
            after = current_files[path]
            if before["size"] != after["size"] or before["modifiedUtc"] != after["modifiedUtc"]:
                modified.append({"before": before, "after": after})

        if added or removed or modified:
            albums_changed.append(
                {
                    "personId": person_id,
                    "added": added,
                    "removed": removed,
                    "modified": modified,
                }
            )

    summary = {
        "albumsChanged": len(albums_changed),
        "addedFiles": sum(len(album["added"]) for album in albums_changed),
        "removedFiles": sum(len(album["removed"]) for album in albums_changed),
        "modifiedFiles": sum(len(album["modified"]) for album in albums_changed),
    }

    return {
        "generatedAtUtc": current["generatedAtUtc"],
        "baselineGeneratedAtUtc": (previous or {}).get("generatedAtUtc"),
        "summary": summary,
        "albums": albums_changed,
    }


def render_changes_markdown(changes: Dict) -> str:
    lines = [
        "# Photo Album Changes",
        "",
        f"- Generated: `{changes['generatedAtUtc']}`",
        f"- Baseline: `{changes.get('baselineGeneratedAtUtc') or 'none'}`",
        f"- Albums changed: `{changes['summary']['albumsChanged']}`",
        f"- Added files: `{changes['summary']['addedFiles']}`",
        f"- Removed files: `{changes['summary']['removedFiles']}`",
        f"- Modified files: `{changes['summary']['modifiedFiles']}`",
        "",
    ]

    if not changes["albums"]:
        lines.append("No changes detected.")
        lines.append("")
        return "\n".join(lines)

    for album in changes["albums"]:
        lines.append(f"## {album['personId']}")
        lines.append("")

        if album["added"]:
            lines.append("Added:")
            for item in album["added"]:
                lines.append(f"- `{item['path']}`")
            lines.append("")

        if album["removed"]:
            lines.append("Removed:")
            for item in album["removed"]:
                lines.append(f"- `{item['path']}`")
            lines.append("")

        if album["modified"]:
            lines.append("Modified:")
            for item in album["modified"]:
                lines.append(f"- `{item['after']['path']}`")
            lines.append("")

    return "\n".join(lines)


def write_outputs(index_data: Dict, changes: Dict) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    INDEX_FILE.write_text(json.dumps(index_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHANGES_FILE.write_text(json.dumps(changes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHANGES_MARKDOWN.write_text(render_changes_markdown(changes), encoding="utf-8")


def build_index_and_changes() -> Tuple[Dict, Dict, List[str]]:
    previous = load_json(INDEX_FILE)
    created_dirs = ensure_album_directories()
    current = scan_photo_root()
    changes = diff_indexes(previous, current)
    return current, changes, created_dirs


def main() -> None:
    index_data, changes, created_dirs = build_index_and_changes()
    write_outputs(index_data, changes)
    print(
        "Indexed photo albums: "
        f"{index_data['albumCount']} albums, "
        f"{len(created_dirs)} directories created, "
        f"{changes['summary']['addedFiles']} added, "
        f"{changes['summary']['removedFiles']} removed, "
        f"{changes['summary']['modifiedFiles']} modified."
    )


if __name__ == "__main__":
    main()
