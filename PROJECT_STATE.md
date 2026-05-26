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

Public GitHub Pages URL confirmed by the user as working:

```text
https://oleg3479881328-code.github.io/family-memory-book/
```

## Maintainer

Primary maintainer: Oleg Povalyukhin.

## Source DOCX Storage Model

The source DOCX is stored locally on the maintainer's computer.

This is intentional for the current project state.

Before running extraction, the maintainer must confirm the local DOCX path and file availability.

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
- `docs/MAINTENANCE.md`
- `docs/ARCHITECTURE.md`
- `CHANGELOG.md`
- `LICENSE.md`
- `index.html`
- `styles.css`

`data/family.js` should be treated as structured family data and changed only with source-backed intent.

## Known Risks

- `tools/extract_docx.py` depends on a local Windows DOCX path.
- The source DOCX is local to the maintainer's computer and is not documented as a shared repository asset.
- Family memoir text is sensitive and should not be silently rewritten.
- Family relationships must not be changed without source evidence.
- Photo removal or replacement must be explicit and reviewable.
- Generated or extracted files must not be edited casually without explaining whether extraction was re-run.

## Closed Questions

- Public GitHub Pages URL: confirmed working by the user.
- Primary maintainer: Oleg Povalyukhin.
- Source DOCX storage model: local computer storage.
- Separate privacy/consent rules: not needed at this stage.

## Open Questions

No blocking open questions for documentation v1.0.

## Current Next Step

Run a final documentation review for v1.0 completeness.
