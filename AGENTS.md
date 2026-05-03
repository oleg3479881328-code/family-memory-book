## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

Context cost:
- Skip Graphify for narrow tasks involving 1-5 known files or text that fits comfortably in context.
- Use Graphify for broad/unknown scope, architecture, dependencies, cross-file relationships, rationale, or repeated project memory.
- If unsure, first inspect scope cheaply with `rg --files`; read files directly when that is enough.

Final response:
- After setup, graph updates, or generated exports, keep the final answer short: one sentence plus changed/output paths. Do not repeat rule text or long artifact contents unless asked.

Mermaid output:
- When asked for Mermaid, output raw Mermaid text by default. The first line must be `flowchart TD` or another diagram declaration, with no preceding ```mermaid fence or prose.

Unicode/Russian text:
- Preserve Cyrillic text as UTF-8; do not transliterate names, titles, quotations, or bibliographic fields.
- On Windows, set `PYTHONIOENCODING=utf-8` before Python snippets that read, write, or print non-ASCII text.
- Use explicit `encoding="utf-8"` for Python text I/O and `json.dumps(..., ensure_ascii=False)` when serializing extracted graph data with Cyrillic.
