# Codex Handoff

## Purpose

This file defines the minimum repository-specific constraints for future Codex work in `family-memory-book`.

## Required Handoff Packet

Use this structure before meaningful repository edits:

```text
IMPLEMENTATION HANDOFF PACKET

Objective:
Allowed Scope:
Out of Scope:
Files Allowed To Change:
Forbidden Changes:
Content Preservation Rules:
Validation Checks:
Execution Report Contract:
```

## Repository-Specific Forbidden Changes

Do not:

- fabricate family history;
- rewrite memoir text without explicit approval;
- change family relationships without source evidence;
- delete or replace photos silently;
- edit extracted files without explaining whether extraction was re-run;
- change deployment behavior without explicit instruction;
- run DOCX extraction without confirming the local source path.

## Default Content Preservation Rules

- Preserve Russian memoir text unless the task explicitly says otherwise.
- Treat family data as source-sensitive.
- Keep sensitive family materials reviewable and reversible.
- Explain any change that touches generated or extracted artifacts.

## Recommended Validation Checks

Depending on scope, validate:

- documentation file paths are correct;
- local preview instructions are still accurate;
- changed files match the approved scope;
- no unintended edits touched sensitive data files;
- execution report separates completed checks from unperformed checks.

## Required Execution Report

Return:

```text
EXECUTION REPORT

Status:
Files Changed:
Validation Performed:
Validation Not Performed:
Blockers:
Assumptions Made:
Risks / Follow-Up:
Ready For Review: Yes / No
```
