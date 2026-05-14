import json
import pathlib
import re
import subprocess
from collections import defaultdict
from datetime import datetime
from time import sleep

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename


ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ASSETS_DIR = ROOT / "assets" / "photo-albums"
FAMILY_FILE = DATA_DIR / "family.js"
ALBUMS_FILE = DATA_DIR / "photo-albums.js"
INDEX_FILE = ROOT / "index.html"
MAX_CONTENT_LENGTH = 64 * 1024 * 1024
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
GITHUB_REPO = "oleg3479881328-code/family-memory-book"

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH


def run_git(*args: str):
    return subprocess.run(
        ["git", *args],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


def run_gh_api(*args: str):
    return subprocess.run(
        ["gh", "api", *args],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


def bump_hosted_asset_version():
    index_html = INDEX_FILE.read_text(encoding="utf-8")
    next_version = datetime.now().strftime("%Y%m%d%H%M%S")
    updated_html, replacements = re.subn(
        r'const hostedVersion = "[^"]+";',
        f'const hostedVersion = "{next_version}";',
        index_html,
        count=1,
    )
    if replacements:
        INDEX_FILE.write_text(updated_html, encoding="utf-8")


def request_pages_build():
    result = run_gh_api("-X", "POST", f"repos/{GITHUB_REPO}/pages/builds")
    return json.loads(result.stdout)


def get_latest_pages_build():
    result = run_gh_api(f"repos/{GITHUB_REPO}/pages/builds/latest")
    return json.loads(result.stdout)


def wait_for_pages_build(timeout_seconds: int = 90, poll_interval_seconds: int = 3):
    deadline = datetime.now().timestamp() + timeout_seconds
    latest = None

    while datetime.now().timestamp() < deadline:
        latest = get_latest_pages_build()
        if latest.get("status") in {"built", "errored"}:
            return latest
        sleep(poll_interval_seconds)

    return latest


def load_window_data(script_path: pathlib.Path, global_name: str):
    node_script = f"""
global.window = {{}};
require({json.dumps(str(script_path))});
process.stdout.write(JSON.stringify(window[{json.dumps(global_name)}]));
"""
    result = subprocess.run(
        ["node", "-e", node_script],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return json.loads(result.stdout)


@app.after_request
def apply_api_cors(response):
    if request.path.startswith("/api/admin/"):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response


def load_family():
    return load_window_data(FAMILY_FILE, "FAMILY")


def load_albums():
    return load_window_data(ALBUMS_FILE, "PHOTO_ALBUMS")


def write_window_assignment(path: pathlib.Path, prefix: str, value):
    path.write_text(
        prefix + " " + json.dumps(value, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )


def allowed_file(filename: str) -> bool:
    return pathlib.Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def ensure_unique_name(directory: pathlib.Path, filename: str) -> str:
    candidate = pathlib.Path(secure_filename(filename)).name or "image"
    stem = pathlib.Path(candidate).stem
    suffix = pathlib.Path(candidate).suffix
    index = 2
    while (directory / candidate).exists():
        candidate = f"{stem}-{index}{suffix}"
        index += 1
    return candidate


def album_index_by_person(albums):
    return {album["personId"]: album for album in albums}


def delete_removed_files(paths):
    for relative_path in paths:
        candidate = (ROOT / relative_path).resolve()
        try:
            candidate.relative_to(ASSETS_DIR.resolve())
        except ValueError:
            continue
        if candidate.is_file():
            candidate.unlink()


def append_uploads(albums, uploaded_files):
    albums_by_person = album_index_by_person(albums)

    for person_id, files in uploaded_files.items():
        album = albums_by_person.get(person_id)
        if not album:
            continue

        target_dir = ASSETS_DIR / person_id / "uploaded"
        target_dir.mkdir(parents=True, exist_ok=True)

        for upload_id, storage in files:
            if not storage.filename:
                continue
            if not allowed_file(storage.filename):
                continue

            filename = ensure_unique_name(target_dir, storage.filename)
            target_path = target_dir / filename
            storage.save(target_path)
            relative_path = target_path.relative_to(ROOT).as_posix()
            next_index = len(album.get("photos", [])) + 1
            album.setdefault("photos", []).append(
                {
                    "src": relative_path,
                    "caption": f"Фотоальбом {album.get('title') or person_id}. Фото {next_index}",
                }
            )
            if album.get("portrait") == f"__upload__:{upload_id}":
                album["portrait"] = relative_path
            elif not album.get("portrait"):
                album["portrait"] = relative_path


@app.get("/api/admin/state")
def admin_state():
    return jsonify({"family": load_family(), "albums": load_albums()})


@app.post("/api/admin/save")
def admin_save():
    payload = request.form.get("payload", "")
    if not payload:
        return jsonify({"error": "Missing payload"}), 400

    data = json.loads(payload)
    family = data["family"]
    albums = data["albums"]
    deleted_photos = data.get("deletedPhotos", [])

    uploads = defaultdict(list)
    for field_name, storage in request.files.items(multi=True):
        if not field_name.startswith("upload:"):
            continue
        _, person_id, upload_id = field_name.split(":", 2)
        uploads[person_id].append((upload_id, storage))

    delete_removed_files(deleted_photos)
    append_uploads(albums, uploads)

    write_window_assignment(FAMILY_FILE, "window.FAMILY =", family)
    write_window_assignment(ALBUMS_FILE, "window.PHOTO_ALBUMS =", albums)

    return jsonify({"family": family, "albums": albums})


@app.route("/api/admin/publish", methods=["POST", "OPTIONS"])
def admin_publish():
    if request.method == "OPTIONS":
        return ("", 204)

    status_before = run_git("status", "--porcelain").stdout
    if not status_before.strip():
        return jsonify({"ok": True, "noChanges": True})

    bump_hosted_asset_version()
    run_git("add", "-A", ".")

    status_after_add = run_git("status", "--porcelain").stdout
    if not status_after_add.strip():
        return jsonify({"ok": True, "noChanges": True})

    commit = run_git("commit", "-m", "Publish site updates")
    commit_hash = run_git("rev-parse", "--short", "HEAD").stdout.strip()
    run_git("push", "origin", "main")
    request_pages_build()
    pages_build = wait_for_pages_build()

    return jsonify(
        {
            "ok": True,
            "noChanges": False,
            "commit": commit_hash,
            "summary": commit.stdout.strip() or commit.stderr.strip(),
            "hadChanges": bool(status_before.strip()),
            "pagesBuild": {
                "status": pages_build.get("status") if pages_build else "unknown",
                "error": (pages_build.get("error") or {}).get("message") if pages_build else None,
                "commit": pages_build.get("commit") if pages_build else None,
            },
        }
    )


@app.get("/")
def site_index():
    return send_from_directory(ROOT, "index.html")


@app.get("/admin")
@app.get("/admin/")
def admin_index():
    return send_from_directory(ROOT / "admin", "index.html")


@app.get("/<path:filename>")
def site_files(filename: str):
    return send_from_directory(ROOT, filename)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8765, debug=False)
