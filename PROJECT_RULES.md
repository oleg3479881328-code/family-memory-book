# Project Rules

## Scope

This repository is a static family memory website that combines genealogy, memoir text, photos, photo albums, and maintainer tooling.

Documentation and maintenance changes must preserve family content integrity.

## Rules

1. Preserve content-bearing artifacts carefully.
   This includes at minimum `data/*.js`, `family-memory-book.ged`, `assets/photo-albums/**`, and user-facing site copy.

2. Do not invent or silently normalize family content.
   Do not invent family facts, rewrite memoir prose without instruction, change genealogy relationships without source evidence, or rename people/family links by assumption.

3. Do not perform destructive content changes without explicit approval.
   Do not mass-delete, mass-rename, reorganize, or remove photos or albums without clear user approval.

4. Treat generated and extracted files carefully.
   Do not modify `data/memoirs.js` or `assets/photos/` casually without stating whether extraction was re-run, content was manually edited, or the DOCX source changed.

5. Preserve static-first architecture by default.
   The current baseline is vanilla HTML/CSS/JS plus vendored libraries and Python helper tooling. Do not introduce a framework, bundler, or backend rewrite unless that decision is explicitly recorded first.

6. Preserve UTF-8 and Cyrillic text faithfully.
   Do not transliterate names or rewrite user content into ASCII unless there is a specific, recorded reason.

7. Use evidence for admin, publish, and extraction claims.
   Do not claim local admin flow, Pages publish, album sync, or extraction succeeded without command output or direct verification.

8. Respect existing unrelated worktree changes.
   If the repo is dirty, do not overwrite or revert pre-existing user changes unless explicitly instructed.

9. Keep important state out of chat-only memory.
   If a rule, risk, coordination decision, or durable next step matters for future maintenance, record it in repository artifacts or the GitHub execution surface.
