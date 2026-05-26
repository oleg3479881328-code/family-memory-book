# Project Rules

## Scope

This repository is a static family memory website that combines genealogy, memoir text, and photos.

Documentation and maintenance changes must preserve family content integrity.

## Content Preservation Rules

Do not:

- invent family facts;
- rewrite memoir prose unless explicitly instructed;
- change genealogy relationships without source evidence;
- rename people or family links without confirmation;
- delete photos without explicit approval;
- remove source-sensitive context silently.

## Generated And Extracted Files

Treat generated or extracted artifacts carefully.

Do not modify `data/memoirs.js` or `assets/photos/` casually without stating whether:

- extraction was re-run;
- content was manually edited;
- the source DOCX changed.

## Tooling Rules

`tools/extract_docx.py` depends on a local DOCX source path.

Do not assume it is portable without verification.

Do not run extraction blindly without confirming:

- source path exists;
- output impact is understood;
- resulting file changes are reviewable.

## Documentation Rules

Documentation should help:

- a human maintainer;
- a future AI executor;
- a reviewer checking sensitive family content.

Repository docs should distinguish:

- public-facing site purpose;
- maintainer-facing workflow;
- generated versus manually maintained content.

## Review Rules

Before accepting repository changes, verify:

- memoir text preservation;
- genealogy integrity;
- photo handling safety;
- local preview still works when relevant;
- generated-file behavior is explained;
- no silent scope expansion occurred.

## State Rule

Important project state must not live only in chat.

If a rule, risk, or constraint matters for future maintenance, record it in repository artifacts.
