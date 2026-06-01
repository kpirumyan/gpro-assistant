# ADR-007: Local RAG Integration via CLI Scripts

**Context**: The agent (Antigravity) needs access to specific framework documentation (e.g., React 19) without consuming massive token context or hallucinating features.

**Decision**: Use AnythingLLM as a local RAG server. Create domain-specific CLI scripts (e.g., `npm run ask-react-rag`) that the agent can invoke to query the workspace.

**Consequence**: The agent can autonomously retrieve precise, version-matched documentation. It enforces a JSON-only response format for programmatic parsing and maintains conversation threads in `.agents/rag-sessions/` to allow follow-up clarifications.
