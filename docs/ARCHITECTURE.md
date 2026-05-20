# Architecture

## Purpose

This document explains the structure and data flow of the `family-memory-book` static website.

The project is a client-side GitHub Pages site. It combines genealogy data, memoir text, photos, and static UI code.

## High-Level Architecture

```text
Browser
  ↓
index.html
  ↓
styles.css
  ↓
JavaScript data files
  ├── data/family.js
  └── data/memoirs.js
  ↓
UI sections
  ├── genealogy tree
  ├── memoir reader
  └── photo archive
  ↓
assets/photos/
```

## Main Runtime Files

```text
index.html
styles.css
data/family.js
data/memoirs.js
assets/photos/
vendor/family-chart/
```

## File Roles

### `index.html`

Main site entry point.

Responsibilities:

- defines page structure;
- loads styles;
- loads data scripts;
- renders site sections;
- connects genealogy, memoir, and photo interactions;
- handles local preview behavior and asset versioning.

### `styles.css`

Main styling layer.

Responsibilities:

- layout;
- typography;
- visual sections;
- tree display styling;
- memoir reader styling;
- photo gallery and modal styling.

### `data/family.js`

Structured genealogy data.

Responsibilities:

- stores people records;
- stores family relationships;
- supports tree rendering;
- links people to memoir or photo content when available.

Maintenance rule:

Do not change relationships without source-backed intent and review.

### `data/memoirs.js`

Memoir content data extracted from a DOCX source.

Responsibilities:

- stores memoir sections;
- stores Russian text content;
- supports memoir reader rendering.

Maintenance rule:

Treat this file as extracted/generated content unless proven otherwise.

### `assets/photos/`

Photo assets used by the site.

Responsibilities:

- stores extracted photos;
- supports photo archive display;
- supports person/photo connections.

Maintenance rule:

Do not rename, delete, or replace assets without explicit review.

### `vendor/family-chart/`

Local dependency for genealogy chart rendering.

Responsibilities:

- provides chart behavior or styling required by the tree UI.

Maintenance rule:

Do not modify vendor files unless the task explicitly targets the dependency.

### `tools/extract_docx.py`

Utility script for extracting memoir text and photos from a DOCX source.

Responsibilities:

- reads the DOCX file;
- extracts text sections;
- extracts embedded media;
- writes memoir data;
- writes photo assets.

Known constraint:

The script depends on a local Windows file path. It is not fully portable without path adjustment.

## Documentation Files

```text
README.md
PROJECT_ENTRYPOINT.md
PROJECT_STATE.md
PROJECT_RULES.md
docs/CODEX_HANDOFF.md
docs/MAINTENANCE.md
docs/ARCHITECTURE.md
```

### `README.md`

Public front door.

Explains:

- what the project is;
- how to preview it;
- where important files live;
- what rules must be respected.

### `PROJECT_ENTRYPOINT.md`

Operational entrypoint for humans and AI systems.

Explains:

- current stage;
- what is allowed;
- what is blocked;
- what to read first.

### `PROJECT_STATE.md`

Current project state and risk register.

Explains:

- repository roles;
- generated versus maintained files;
- known risks;
- open questions.

### `PROJECT_RULES.md`

Maintenance rules.

Defines:

- content preservation rules;
- generated file rules;
- tooling rules;
- review rules.

### `docs/CODEX_HANDOFF.md`

Execution handoff template.

Used before asking Codex or another AI executor to change repository files.

### `docs/MAINTENANCE.md`

Maintenance workflow guide.

Explains:

- local preview;
- safe update workflow;
- validation checklist;
- common maintenance tasks.

## Data Flow

### Site Load Flow

```text
User opens site
  ↓
Browser loads index.html
  ↓
index.html loads CSS and data files
  ↓
family data powers genealogy tree
  ↓
memoir data powers memoir reader
  ↓
photo assets power photo archive
  ↓
user interacts with tree, memoirs, and photos
```

### Extraction Flow

```text
Source DOCX
  ↓
tools/extract_docx.py
  ↓
text sections extracted
  ↓
photos extracted
  ↓
data/memoirs.js updated
  ↓
assets/photos/ updated
  ↓
site preview and review required
```

## Generated Versus Maintained Boundary

Likely generated or extracted:

```text
data/memoirs.js
assets/photos/
```

Maintained directly:

```text
README.md
PROJECT_ENTRYPOINT.md
PROJECT_STATE.md
PROJECT_RULES.md
docs/CODEX_HANDOFF.md
docs/MAINTENANCE.md
docs/ARCHITECTURE.md
index.html
styles.css
data/family.js
```

Important nuance:

`data/family.js` is structured data. It may be manually maintained, but it must still be changed carefully because it represents relationship data.

## Safe Change Boundaries

### Safe Documentation Changes

Usually safe when reviewed:

- README improvements;
- maintenance guide updates;
- architecture documentation;
- state/rules clarifications;
- handoff template improvements.

### Risky Data Changes

Require explicit review:

- `data/family.js` changes;
- `data/memoirs.js` changes;
- `assets/photos/` changes;
- extraction script changes;
- vendor dependency changes.

### Implementation Changes

Require a scoped handoff:

- UI behavior changes;
- modal behavior changes;
- tree rendering changes;
- asset loading changes;
- deployment behavior changes.

## Review Checklist For Architecture-Sensitive Changes

Before accepting architecture-sensitive changes, check:

- [ ] Site still opens locally.
- [ ] Main navigation works.
- [ ] Genealogy tree loads.
- [ ] Memoir reader loads.
- [ ] Photo archive loads.
- [ ] Asset paths remain valid.
- [ ] Generated files are handled intentionally.
- [ ] Documentation reflects the new state.
- [ ] No unrelated files changed.

## Current Architecture Status

Status: static client-side site with local data files and local extraction tooling.

No backend, database, API server, or build pipeline is currently documented as required.

## Recommended Next Architecture Improvements

Potential future improvements:

- document the public GitHub Pages URL;
- clarify whether DOCX source should remain external;
- document exact static server command for local preview;
- add changelog discipline;
- add license or usage-rights clarification.
