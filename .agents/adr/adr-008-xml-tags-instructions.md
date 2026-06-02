# ADR-008: XML tags for agent instructions

**Context**: AI agents (like Antigravity) sometimes miss critical constraints or rules when they are buried in plain markdown text.

**Decision**: Use XML tags (e.g., `<rule severity="CRITICAL">`, `<workflow>`, `<constraints>`) to wrap important instructions, checklists, and workflows in `.agents/rules/` and `AGENTS.md`.

**Consequence**: The agent parses these explicit structures more reliably, significantly reducing the chance of ignoring critical rules or hallucinating behaviors.
