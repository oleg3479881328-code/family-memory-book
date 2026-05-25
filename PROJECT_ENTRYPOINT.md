# Project Entrypoint

## Project Name

Книга памяти семьи

## What This Project Is

This repository is a static GitHub Pages family memory website.

It combines:

- interactive genealogy;
- family memoir sections in Russian;
- photo archive;
- structured family data;
- extracted materials from a DOCX source;
- local admin and album-maintenance tooling.

## Current Stage

Working static site with maintainer documentation now being normalized into a reusable project-memory layer.

## Entry Rules

Before changing this repository, read:

1. `README.md`
2. `PROJECT_STATE.md`
3. `PROJECT_RULES.md`
4. `docs/CODEX_HANDOFF.md`
5. `graphify-out/GRAPH_REPORT.md`

## Source Of Truth

Active durable layer:

- GitHub repository / local repo files for code, data, assets, and project-local documentation

Supporting but non-canonical layers:

- `graphify-out/` for repository navigation memory and generated analysis
- chat for live discussion until important state is written into repo or GitHub

## Coordination Channel

Default coordination split for this project:

- `Chat` for live discussion with Oleg
- `GitHub issue / PR / review thread` for repository-bound execution requests, status, review, and commit-linked evidence
- `PROJECT_ENTRYPOINT.md`, `PROJECT_STATE.md`, `PROJECT_RULES.md`, and `logs/WORKFLOW_LOG.md` for durable repo-memory state

Rule:

- do not rely on human relay as the primary state bridge between ChatGPT and Codex when the information can be written into GitHub or repo-memory instead

## What Is Allowed Now

Allowed with explicit task scope:

- improve documentation;
- clarify repository structure;
- document maintenance workflow;
- document local preview or admin steps;
- document validation checks;
- perform bounded maintenance work with evidence.

## What Is Blocked Without Explicit Instruction

Do not:

- rewrite memoir text;
- invent family facts;
- change genealogy relationships;
- delete photos;
- silently modify extracted or generated data;
- change deployment behavior;
- run extraction without confirming DOCX source path.

## Current Next Step

Review the already-existing uncommitted root-level changes (`README.md`, `start.bat`) and decide whether they should become the first bounded post-normalization workflow in this repo.
