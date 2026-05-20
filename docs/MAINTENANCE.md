# Maintenance Guide

## Purpose

This guide explains how to safely maintain the `family-memory-book` repository.

The project is a static GitHub Pages family memory website with genealogy data, memoir text, photos, and a DOCX extraction workflow.

## Maintenance Priorities

Priority order:

1. Preserve family content integrity.
2. Keep the static site working.
3. Keep generated and manually maintained files clearly separated.
4. Keep future AI-assisted work safe and reviewable.
5. Document every important maintenance decision in repository files.

## Local Preview

Minimal preview:

1. Open `index.html` directly in a browser.

Alternative preview:

1. Start any static server from the repository root.
2. Open the local server URL in a browser.
3. Check the main sections:
   - genealogy tree;
   - memoir reader;
   - photo archive;
   - person/photo modal behavior.

## Repository Map

```text
index.html                  Main static site page
styles.css                  Site styling
data/family.js              Structured genealogy data
data/memoirs.js             Memoir text data extracted from DOCX
assets/photos/              Photo assets extracted from DOCX
vendor/family-chart/        Local genealogy chart dependency
tools/extract_docx.py       DOCX extraction utility
README.md                   Public front door and navigation
PROJECT_ENTRYPOINT.md       Human/AI entrypoint
PROJECT_STATE.md            Current state and risks
PROJECT_RULES.md            Maintenance rules
docs/CODEX_HANDOFF.md       AI execution handoff template
```

## Generated / Extracted Content

Treat these as extracted or generated content:

- `data/memoirs.js`
- `assets/photos/`

Do not edit them casually.

Before changing extracted content, record whether:

- the DOCX extraction was re-run;
- the file was edited manually;
- the source DOCX changed;
- the output was reviewed.

## Manual / Maintainer Content

Treat these as maintainer-facing files:

- `README.md`
- `PROJECT_ENTRYPOINT.md`
- `PROJECT_STATE.md`
- `PROJECT_RULES.md`
- `docs/CODEX_HANDOFF.md`
- `docs/MAINTENANCE.md`
- `index.html`
- `styles.css`

## DOCX Extraction Workflow

The extraction script is:

```text
tools/extract_docx.py
```

Known risk:

The script uses a local Windows path to the source DOCX file.

Before running the script, verify:

- the DOCX file exists locally;
- the path inside the script is correct;
- the expected output files are understood;
- current generated files are backed up or tracked by git;
- the resulting diff is reviewed before commit.

## Safe Update Workflow

Use this workflow for any meaningful update:

1. Read `PROJECT_STATE.md`.
2. Read `PROJECT_RULES.md`.
3. Define the exact change.
4. Identify files allowed to change.
5. Make the smallest necessary edit.
6. Preview the site locally.
7. Review the diff.
8. Commit only the intended files.
9. Record important decisions in project documentation.

## Validation Checklist

Before accepting changes, check:

- [ ] Site opens locally.
- [ ] Main navigation works.
- [ ] Genealogy section loads.
- [ ] Memoir section loads.
- [ ] Photo section loads.
- [ ] No unrelated files changed.
- [ ] Generated/extracted file changes are explained.
- [ ] Memoir text was not rewritten without instruction.
- [ ] Genealogy relationships were not changed without source review.
- [ ] Photos were not deleted, renamed, or replaced without explicit decision.
- [ ] Documentation reflects the current state.

## AI-Assisted Maintenance

Before using Codex or another AI executor, prepare a handoff packet using:

```text
docs/CODEX_HANDOFF.md
```

The handoff must define:

- objective;
- allowed scope;
- out of scope;
- files allowed to change;
- forbidden changes;
- validation checks;
- execution report contract.

Do not give vague tasks such as "clean up the repo" or "improve the site" without boundaries.

## Common Maintenance Tasks

### Update README or Documentation

Allowed when scope is clear.

Check:

- links still work;
- file paths are accurate;
- project state remains consistent.

### Update Genealogy Data

Allowed only with source-backed intent.

Check:

- person records remain valid;
- relationships are correct;
- UI still loads the tree.

### Update Memoir Text

Do not rewrite memoir prose unless explicitly instructed.

If text changes, document the reason.

### Update Photos

Do not delete, rename, or replace photos without explicit approval.

Check:

- photo paths still work;
- captions remain accurate;
- the gallery still loads.

### Re-run DOCX Extraction

Only run after verifying the source DOCX path and expected output.

After extraction:

- inspect changed files;
- verify memoir sections;
- verify photos;
- preview the site.

## Current Known Risks

- Local DOCX path is machine-specific.
- Extracted files can be overwritten by script output.
- Family content requires careful review.
- Public repository visibility means documentation should avoid exposing unnecessary private workflow details.

## Recommended Next Improvements

Potential next documentation files:

- `docs/ARCHITECTURE.md` — site structure and data flow.
- `CHANGELOG.md` — history of project changes.
- `LICENSE` — usage rights and legal clarity.

## Rule

If a future maintainer or AI cannot explain why a change is safe, the change should not be accepted.
