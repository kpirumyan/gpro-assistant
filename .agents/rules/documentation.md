# Documentation Maintenance

## XML Standard

<rule-ref id="xml_standard" source=".agents/rules/xml-standard.md" />

Before creating or modifying XML-tagged rules, read [xml-standard.md](.agents/rules/xml-standard.md) for the full tag vocabulary, severity scale, attribute dictionary, naming conventions, and validation checklist.

## Rules

<documentation-rules>
  <rule id="self_correction" severity="CRITICAL">Whenever you make a critical error, discover a bug in your own workflow, or learn a required workaround, you MUST immediately document it in the relevant `.agents/` rules file or `AGENTS.md`. Do not simply apologize and promise to remember it — write it down so future agent sessions will not repeat the mistake.</rule>
  <rule id="no_rule_duplication" severity="CRITICAL">You MUST NOT duplicate rule or workflow definitions across different files. Define each rule in a single source of truth. For general rules that must always be active in the system prompt, define them in `AGENTS.md`. For specific technical details, define them in `.agents/rules/` and reference them if needed instead of duplicating the exact definition.</rule>
  <rule id="adr_for_new_patterns" severity="MANDATORY">When introducing a new design pattern, structural convention, or tag to the agent system, create an Architecture Decision Record under `.agents/adr/` following the `adr-###-[description].md` naming convention, and add a link to it in `.agents/ARCHITECTURE.md`.</rule>
  <rule id="rule_sorting" severity="MANDATORY">When adding multiple rules to a file (especially `AGENTS.md`), group them logically by their `domain` attribute (if present). Within each group or container, sort the rules by `severity` in descending order of importance (ABSOLUTE first, then CRITICAL, then MANDATORY).</rule>
</documentation-rules>
