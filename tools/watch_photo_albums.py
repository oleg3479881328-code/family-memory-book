import json
import time

from photo_album_index import build_index_and_changes, write_outputs


def fingerprint(index_data):
    payload = []
    for album in index_data.get("albums", []):
        payload.append(
            {
                "personId": album["personId"],
                "files": [
                    (item["path"], item["size"], item["modifiedUtc"])
                    for item in album.get("files", [])
                ],
            }
        )
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":"))


def main() -> None:
    print("Watching assets/photo-albums for changes. Press Ctrl+C to stop.")
    last_signature = None

    while True:
        index_data, changes = build_index_and_changes()
        current_signature = fingerprint(index_data)

        if current_signature != last_signature:
            write_outputs(index_data, changes)
            summary = changes["summary"]
            print(
                f"[photo-index] {index_data['generatedAtUtc']} | "
                f"changed albums: {summary['albumsChanged']}, "
                f"added: {summary['addedFiles']}, "
                f"removed: {summary['removedFiles']}, "
                f"modified: {summary['modifiedFiles']}"
            )
            last_signature = current_signature

        time.sleep(2)


if __name__ == "__main__":
    main()
