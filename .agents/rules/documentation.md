# Documentation Maintenance

Read this file before creating or editing files under `.agents/`.

<documentation-rules>
  <rule id="self_correction" severity="CRITICAL">Whenever you make a critical error, discover a bug in your own workflow, or learn a required workaround, you MUST immediately document it in the relevant `.agents/` rules file or `AGENTS.md`. Do not simply apologize and promise to remember it — write it down so future agent sessions will not repeat the mistake.</rule>
  <rule id="xml_for_rules" severity="MANDATORY">Always use XML-style tags (e.g. &lt;rule&gt;, &lt;workflow&gt;, &lt;mindset&gt;) to wrap important instructions, workflows, and checklists whenever you create or update files under `.agents/rules/` or `AGENTS.md`. **CRITICAL**: Custom tag names MUST use hyphens instead of underscores (e.g. &lt;system-rules&gt;, not &lt;system_rules&gt;) to ensure they remain hidden in Markdown preview mode.</rule>
  <rule id="no_rule_duplication" severity="CRITICAL">Do NOT duplicate rule or workflow definitions across different files. Define each rule in a single source of truth. For general rules that must always be active in the system prompt, define them in `AGENTS.md`. For specific technical details, define them in `.agents/rules/` and reference them if needed instead of duplicating the exact definition.</rule>
</documentation-rules>
