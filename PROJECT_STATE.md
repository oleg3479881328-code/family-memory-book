# Project State

## Project

`Книга памяти семьи`

Repository:

`oleg3479881328-code/family-memory-book`

## Current Status

Working static GitHub Pages family memory site with:

- interactive genealogy;
- Russian memoir sections;
- extracted photo archive;
- local DOCX extraction workflow.

## Repository Role Summary

- `index.html` - main site entry page
- `styles.css` - site styles
- `data/family.js` - structured genealogy data
- `data/memoirs.js` - extracted memoir text data
- `assets/photos/` - extracted photo assets
- `tools/extract_docx.py` - extraction script from local DOCX source

## State Separation

Treat these as likely generated or extracted artifacts:

- `data/memoirs.js`
- `assets/photos/`

Treat these as maintainer-facing implementation or documentation artifacts:

- `README.md`
- `PROJECT_ENTRYPOINT.md`
- `PROJECT_STATE.md`
- `PROJECT_RULES.md`
- `docs/CODEX_HANDOFF.md`
- `index.html`
- `styles.css`

`data/family.js` should be treated as structured family data and changed only with source-backed intent.

## Known Risks

- `tools/extract_docx.py` depends on a local Windows DOCX path.
- Family memoir text is sensitive and should not be silently rewritten.
- Family relationships must not be changed without source evidence.
- Photo removal or replacement must be explicit and reviewable.
- Generated or extracted files must not be edited casually without explaining whether extraction was re-run.

## Open Questions

- What is the intended public GitHub Pages URL?
- Who is the primary maintainer?
- Is the external DOCX storage model intentional long-term?
- Should privacy or consent rules be documented more explicitly for family photos and memoirs?

## Current Next Step

Review this documentation package and decide whether to transfer it into `family-memory-book`.
