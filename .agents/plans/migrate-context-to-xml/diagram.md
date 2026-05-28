```mermaid
graph TD
    A[Markdown Files] -->|Migrate Rules| B[XML Wrappers]
    B --> C{Files}
    C --> D[AGENTS.md]
    C --> E[.agents/skills/code-review-checklist.md]
    C --> F[.agents/skills/nextjs-rules.md]
    C --> G[.agents/skills/testing-rules.md]
    C --> H[.agents/ARCHITECTURE.md]
    
    D --> I[Workflow & Modes]
    E --> J[Checklists]
    F --> K[Critical Constraints]
    G --> L[Testing Rules]
    H --> M[Key Patterns]
```
