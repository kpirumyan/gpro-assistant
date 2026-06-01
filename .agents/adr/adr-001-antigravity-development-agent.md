# ADR-001: Antigravity as sole development agent

**Context**: Multiple AI tools (Cursor, Aider, Claude Code) were trialed, creating configuration conflicts.

**Decision**: Use only Antigravity. All agent config lives in AGENTS.md + `.agents/skills/`.

**Consequence**: Single source of truth for agent behavior. CLAUDE.md and other tool configs removed.
