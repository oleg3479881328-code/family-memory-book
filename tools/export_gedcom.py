import json
import pathlib
import re


ROOT = pathlib.Path(__file__).resolve().parents[1]
FAMILY_JS = ROOT / "data" / "family.js"
OUTPUT = ROOT / "family-memory-book.ged"

MONTHS = {
    "01": "JAN",
    "02": "FEB",
    "03": "MAR",
    "04": "APR",
    "05": "MAY",
    "06": "JUN",
    "07": "JUL",
    "08": "AUG",
    "09": "SEP",
    "10": "OCT",
    "11": "NOV",
    "12": "DEC",
}


def load_family():
    text = FAMILY_JS.read_text(encoding="utf-8").strip()
    prefix = "window.FAMILY = "
    suffix = ";"
    if not text.startswith(prefix) or not text.endswith(suffix):
        raise ValueError("Unexpected family.js format")
    payload = text[len(prefix) : -len(suffix)]
    payload = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)', r'\1"\2"\3', payload)
    return json.loads(payload)


def gedcom_date(raw):
    raw = (raw or "").strip()
    if not raw:
        return []

    if "–" in raw:
        parts = [part.strip() for part in raw.split("–", 1)]
        if len(parts) == 2:
            return [
                ("BIRT", normalize_single_date(parts[0])),
                ("DEAT", normalize_single_date(parts[1])),
            ]

    normalized = normalize_single_date(raw)
    return [("BIRT", normalized)] if normalized else []


def normalize_single_date(raw):
    raw = raw.strip()
    if not raw:
        return None

    full = re.fullmatch(r"(\d{2})\.(\d{2})\.(\d{4})", raw)
    if full:
        day, month, year = full.groups()
        return f"{int(day)} {MONTHS[month]} {year}"

    year_only = re.fullmatch(r"\d{4}", raw)
    if year_only:
        return raw

    return None


def build_families(people):
    family_map = {}

    for person_id, person in people.items():
        for partner_id in person.get("partners", []):
            key = tuple(sorted((person_id, partner_id)))
            family_map.setdefault(key, {"husb": None, "wife": None, "chil": []})

    for person_id, person in people.items():
        parents = person.get("parents", [])
        if len(parents) == 2:
            key = tuple(sorted(parents))
            family = family_map.setdefault(key, {"husb": None, "wife": None, "chil": []})
            family["chil"].append(person_id)

    return family_map


def append_wrapped(lines, level, tag, value):
    if not value:
        return
    chunks = [value[i : i + 200] for i in range(0, len(value), 200)]
    lines.append(f"{level} {tag} {chunks[0]}")
    for chunk in chunks[1:]:
        lines.append(f"{level + 1} CONC {chunk}")


def export_gedcom():
    family = load_family()
    people = family["people"]
    families = build_families(people)

    person_ids = list(people.keys())
    fam_keys = list(families.keys())

    indi_xref = {person_id: f"@I{index}@" for index, person_id in enumerate(person_ids, start=1)}
    fam_xref = {key: f"@F{index}@" for index, key in enumerate(fam_keys, start=1)}

    lines = [
        "0 HEAD",
        "1 SOUR family-memory-book",
        "1 GEDC",
        "2 VERS 5.5.1",
        "2 FORM LINEAGE-LINKED",
        "1 CHAR UTF-8",
        "1 LANG Russian",
    ]

    for person_id in person_ids:
        person = people[person_id]
        lines.append(f"0 {indi_xref[person_id]} INDI")
        append_wrapped(lines, 1, "NAME", person["name"])

        for event_tag, event_date in gedcom_date(person.get("dates", "")):
            if event_date:
                lines.append(f"1 {event_tag}")
                lines.append(f"2 DATE {event_date}")

        for note in person.get("notes", []):
            append_wrapped(lines, 1, "NOTE", note)

        parents = person.get("parents", [])
        if len(parents) == 2:
            key = tuple(sorted(parents))
            fam_id = fam_xref.get(key)
            if fam_id:
                lines.append(f"1 FAMC {fam_id}")

        partner_ids = person.get("partners", [])
        seen_fams = set()
        for partner_id in partner_ids:
            key = tuple(sorted((person_id, partner_id)))
            fam_id = fam_xref.get(key)
            if fam_id and fam_id not in seen_fams:
                lines.append(f"1 FAMS {fam_id}")
                seen_fams.add(fam_id)

    for key in fam_keys:
        first, second = key
        family_record = families[key]
        lines.append(f"0 {fam_xref[key]} FAM")
        lines.append(f"1 HUSB {indi_xref[first]}")
        lines.append(f"1 WIFE {indi_xref[second]}")
        for child_id in sorted(set(family_record["chil"]), key=person_ids.index):
            lines.append(f"1 CHIL {indi_xref[child_id]}")

    lines.append("0 TRLR")
    OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    export_gedcom()
