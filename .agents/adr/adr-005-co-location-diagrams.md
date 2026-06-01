# ADR-005: Co-location of architecture diagrams

**Context**: Complex business logic (like calculators or API synchronizations) is hard to maintain without visual architecture diagrams, but global documentation folders easily get out of sync.

**Decision**: Keep Mermaid diagrams and documentation inside the specific service directories in `src/lib/` (e.g. in a local `README.md`).

**Consequence**: Diagrams are highly visible to developers touching the code, raising the likelihood of keeping them updated.
