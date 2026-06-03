# ADR-011: XML Standard Specification as Permanent Reference

**Context**: The XML standard for the agent configuration system was originally authored as a `/discuss` session artifact (`plan-xml-optimization.md`) in the `plans/` directory. Plans are intended for one-time task execution and may be overlooked or orphaned. However, this document defines the canonical severity scale, tag vocabulary, modal language rules, and validation checklist — all of which are essential for every rule file modification.

**Decision**: Promote the XML standard from `plans/` to a permanent reference file at `.agents/rules/xml-standard.md`. Translate it to English (per `code_english` rule). Delete the original plan file to maintain Single Source of Truth. Link the new file in the Context Files Index of `AGENTS.md` and reference it from `documentation.md` via `<rule-ref>`.

**Consequence**: Every agent session that edits `.agents/` files will have clear, discoverable access to the XML specification. The severity quotas, modal language rules, and tag vocabulary are now part of the standard on-demand rule set, reducing the risk of non-compliant rule authoring.
