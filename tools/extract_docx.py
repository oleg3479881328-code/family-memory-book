import json
import pathlib
import shutil
import zipfile
import xml.etree.ElementTree as ET


ROOT = pathlib.Path(__file__).resolve().parents[1]
DOCX = pathlib.Path(r"C:\Users\oleg3\Downloads\Мемуары воспоминания (1).docx")
OUT_DATA = ROOT / "data" / "memoirs.js"
PHOTO_DIR = ROOT / "assets" / "photos"

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
}


def paragraph_text(paragraph):
    parts = []
    for node in paragraph.iter():
        if node.tag == f"{{{NS['w']}}}t" and node.text:
            parts.append(node.text)
        elif node.tag == f"{{{NS['w']}}}tab":
            parts.append(" ")
        elif node.tag == f"{{{NS['w']}}}br":
            parts.append("\n")
    return "".join(parts).strip()


def extract_paragraphs():
    with zipfile.ZipFile(DOCX) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
    return [
        text
        for paragraph in root.findall(".//w:p", NS)
        if (text := paragraph_text(paragraph))
    ]


def section(paragraphs, title, start, end):
    return {
        "id": title.lower().replace(" ", "-"),
        "title": title,
        "paragraphs": paragraphs[start - 1 : end],
    }


def extract_photos():
    PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    photos = []
    with zipfile.ZipFile(DOCX) as archive:
        media = [name for name in archive.namelist() if name.startswith("word/media/")]
        for index, name in enumerate(sorted(media), start=1):
            suffix = pathlib.Path(name).suffix.lower()
            output_name = f"photo-{index:02d}{suffix}"
            output_path = PHOTO_DIR / output_name
            with archive.open(name) as source, output_path.open("wb") as target:
                shutil.copyfileobj(source, target)
            photos.append(
                {
                    "src": f"assets/photos/{output_name}",
                    "original": name,
                    "caption": f"Фотография {index}",
                }
            )
    return photos


def main():
    paragraphs = extract_paragraphs()
    russian_sections = [
        section(paragraphs, "Воспоминания Веры Дмитриевны Подковцевой", 1, 36),
        section(paragraphs, "Наташа", 50, 55),
        section(paragraphs, "Русская печь", 56, 81),
        section(paragraphs, "Семейные хроники", 82, 139),
        section(paragraphs, "Отец", 140, 180),
        section(paragraphs, "Родители", 181, 241),
    ]
    data = {
        "title": "Книга памяти семьи",
        "source": DOCX.name,
        "sections": russian_sections,
        "photos": extract_photos(),
    }
    OUT_DATA.parent.mkdir(parents=True, exist_ok=True)
    OUT_DATA.write_text(
        "window.MEMOIRS = "
        + json.dumps(data, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
