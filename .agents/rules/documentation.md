# Documentation Maintenance

## XML Standard

<rule-ref id="xml_standard" source=".agents/rules/xml-standard.md" />

Before creating or modifying XML-tagged rules, read [xml-standard.md](.agents/rules/xml-standard.md) for the full tag vocabulary, severity scale, attribute dictionary, naming conventions, and validation checklist.

## Rules

<documentation-rules>
  <rule id="self_correction" severity="CRITICAL">Whenever you make a critical error, discover a bug in your own workflow, or learn a required workaround, you MUST immediately document it in the relevant `.agents/` rules file or `AGENTS.md`. Do not simply apologize and promise to remember it — write it down so future agent sessions will not repeat the mistake.</rule>
  <rule id="adr_for_new_patterns" severity="MANDATORY">When introducing a new design pattern, structural convention, or tag to the agent system, create an Architecture Decision Record under `.agents/adr/` following the `adr-###-[description].md` naming convention, and add a link to it in `.agents/ARCHITECTURE.md`.</rule>
</documentation-rules>
