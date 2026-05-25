---
status: in-progress
project_mode: compact-github-backed
current_step: legacy-normalization
last_updated: 2026-05-25
next_action: Review the existing uncommitted README.md and start.bat changes and decide whether to convert them into the first bounded post-normalization workflow.
---

# Project State

## Project

`Книга памяти семьи`

Repository:

`oleg3479881328-code/family-memory-book`

## Current Status

Working static GitHub Pages family memory site with:

- interactive genealogy;
- Russian memoir sections;
- structured family data;
- photo archive and photo albums;
- local DOCX extraction workflow;
- local admin and publish helpers.

Public GitHub Pages URL confirmed by the user as working:

```text
https://oleg3479881328-code.github.io/family-memory-book/
```

## Maintainer

Primary maintainer: Oleg Povalyukhin.

## Current Runtime Surfaces

- public site: `index.html`, `app.js`, `styles.css`
- versioned content: `data/family.js`, `data/memoirs.js`, `data/photo-albums.js`
- admin UI: `admin/`
- local admin server and publish helpers: `tools/admin_server.py`, `start-admin.bat`
- photo album indexing helpers: `tools/photo_album_index.py`, `tools/watch_photo_albums.py`
- DOCX extraction helper: `tools/extract_docx.py`

## Source DOCX Storage Model

The source DOCX is stored locally on the maintainer's computer.

This is intentional for the current project state.

Before running extraction, the maintainer must confirm the local DOCX path and file availability.

## State Separation

Treat these as likely generated or extracted artifacts:

- `data/memoirs.js`
- `assets/photos/`

Treat these as high-value structured project data:

- `data/family.js`
- `data/photo-albums.js`
- `assets/photo-albums/**`
- `family-memory-book.ged`

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
- root site files and tools

## Current Health Snapshot

- public/site stack is simple and recoverable: static HTML/CSS/JS with vendored libraries
- repo memory now exists in both documentation files and `graphify-out/`
- the worktree is already dirty from pre-existing user changes:
  - modified: `README.md`
  - untracked: `start.bat`

These changes were preserved and not normalized away.

## Known Risks

- `tools/extract_docx.py` depends on a local Windows DOCX path
- the source DOCX is local to the maintainer's computer and is not a shared repository asset
- family memoir text is sensitive and should not be silently rewritten
- family relationships must not be changed without source evidence
- photo removal or replacement must be explicit and reviewable
- generated or extracted files must not be edited casually without explaining whether extraction was re-run

## Closed Questions

- public GitHub Pages URL: confirmed working by the user
- primary maintainer: Oleg Povalyukhin
- source DOCX storage model: local computer storage
- separate privacy/consent rules: not needed at this stage

## Current Objective

Bring the project under the new operating model with minimal ceremony and no speculative refactor.
