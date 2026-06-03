# XML Standard for Agent Configuration

> This document is the **canonical specification** for all XML-tagged configuration in the GPRO Assistant agent system. It defines the severity scale, modal language, tag vocabulary, structural principles, and validation checklist.

---

## 1. Severity Scale

### 3 levels with strict quotas (protection against rule dilution)

| Level | Attribute | Quota | Criterion | On violation |
|-------|-----------|-------|-----------|--------------|
| **Absolute** | `severity="ABSOLUTE"` | **≤ 3** across the entire system | Consequences are **irreversible** and extend beyond the codebase (secrets, external systems) | Immediate refusal. No exceptions. No negotiation. |
| **Critical** | `severity="CRITICAL"` | **≤ 10** total | Violation is serious but recoverable within the process | Execute only if `exception=` explicitly allows |
| **Mandatory** | `severity="MANDATORY"` | unlimited | Standard operational behavior | Warn if unable to comply |

> [!IMPORTANT]
> **Rule dilution principle:** If everything is critical, nothing is critical. Quotas are hard limits, not recommendations.

### Current ABSOLUTE rules (3 slots)

| id | Justification |
|----|---------------|
| `context_exclusion` | Violation = secret leakage from `.agentignore`. Irreversible. |
| `no_env_workarounds` | Violation = credential compromise via shell. Irreversible. |
| *(third slot reserved)* | Reserved for future use. Introduced only via ADR. |

> **Note:** `no_coding` and `no_auto_commit` are `CRITICAL`, not `ABSOLUTE`. Their violation is a serious architectural error but recoverable within the process (not a secret leak).

---

## 2. Modal Language Dictionary (RFC 2119)

Correspondence between words in rule text and severity levels:

| Word | Meaning | Allowed in severity |
|------|---------|---------------------|
| **MUST / MUST NOT** | Absolute requirement / prohibition | `ABSOLUTE`, `CRITICAL` |
| **NEVER** | Reinforced prohibition | Only `ABSOLUTE` |
| **SHOULD / SHOULD NOT** | Recommendation, exceptions allowed | `MANDATORY` |
| **MAY** | Permission, not obligation | Descriptive text, not in `<rule>` |

> [!IMPORTANT]
> **SHALL / SHALL NOT** — not used (redundant, causes confusion with MUST).  
> **ALWAYS** — not used as intensifier (weaker than MUST, creates ambiguity).

### Rule: modal words must correlate with severity

```xml
<!-- ✅ CORRECT: MUST NOT → severity="ABSOLUTE" -->
<rule id="context_exclusion" severity="ABSOLUTE">
  You MUST NEVER read files matching .agentignore patterns.
</rule>

<!-- ✅ CORRECT: MUST → severity="CRITICAL" -->
<rule id="no_coding" severity="CRITICAL">
  The Orchestrator MUST NOT write application code directly.
</rule>

<!-- ✅ CORRECT: neutral imperative → severity="MANDATORY" -->
<rule id="error_handling" severity="MANDATORY">
  When a command fails: attempt up to 3 automatic fix cycles.
</rule>

<!-- ❌ INCORRECT: MUST in MANDATORY rule → overstatement -->
<rule id="error_handling" severity="MANDATORY">
  You MUST attempt up to 3 automatic fix cycles.
</rule>
```

---

## 3. Attribute Dictionary

### `<rule>` attributes

```xml
<rule
  id="snake_case_id"                              <!-- Required -->
  severity="ABSOLUTE|CRITICAL|MANDATORY"          <!-- Required -->
  domain="core|security|language|workflow|vcs"    <!-- Required for semantic sorting -->
  scope="orchestrator|coder|tester|reviewer|all"  <!-- If not obvious from context -->
  phase="all|plan|implement|test|review|terminal-audit"  <!-- If applies to a specific phase -->
  exception="/quick-fix|none"                     <!-- Explicitly allowed exceptions -->
  enforced_by="self|orchestrator"                 <!-- Who verifies compliance -->
>
```

> **Minimal attributes principle:** do not add an attribute if its value is obvious from the parent tag.

### `<phase>` attributes

```xml
<phase
  name="Plan|Post-Approval Setup|Implement|Test|Review|Terminal Audit"
  requires_approval="true|false"
  depends_on="PhaseName"
>
```

### `<mode>` attributes

```xml
<mode
  command="/goal|/grill-me|/discuss|/ask|/quick-fix|/dual-arch|/debate"
  autonomous="true|false"
  produces_artifact="true|false"
  invokes_subagents="true|false"
>
```

### `<file-access>` attributes (in permissions)

```xml
<file-access scope="src/**" mode="read|write|read-write" />
```

### `<delegates-to>` tag

```xml
<delegates-to
  agent="Tester|Coder|Reviewer|Architect"
  task="write-failing-tests|implement-feature|review-code|create-plan"
  after="AgentName|none"
  max_iterations="3"
  on_exceed="escalation-protocol"
/>
```

---

## 4. Tag Vocabulary

Complete list of allowed tags. New tags are introduced only via ADR.

| Tag | Purpose |
|-----|---------|
| `<orchestrator>` | Orchestrator configuration block |
| `<persona>` | Agent role and personality description |
| `<rule>` | Single rule with attributes |
| `<rule-ref>` | Reference to a rule in another file (Single Source of Truth) |
| `<system-rules>` | Container for global rules |
| `<role-definition>` | Subagent role description |
| `<permissions>` | Agent access rights block |
| `<file-access>` | File access rule |
| `<agent-workflow>` | Workflow description |
| `<phase>` | Workflow phase |
| `<delegates-to>` | Task delegation to agent |
| `<constraint>` | Constraint (iterations, timeout) |
| `<interaction-modes>` | Interaction modes container |
| `<mode>` | Single interaction mode |
| `<right-of-refusal>` | Agent refusal right (Coder only) |
| `<conditions>` | List of conditions/triggers for `<action>` |
| `<action>` | Action on condition fulfillment |
| `<description>` | Human-readable description (Markdown allowed inside) |

> **Note on `<conditions>`:** Semantically identical to "trigger", but more precise — describes a state/condition, not an event.

---

## 5. Structural Principles

### 5.1 Single Source of Truth

Each rule exists in exactly **one file**.

```xml
<!-- In workflow.md — definition lives here -->
<rule id="no_auto_commit" severity="CRITICAL">...</rule>

<!-- In AGENTS.md — reference only -->
<rule-ref id="no_auto_commit" source=".agents/rules/workflow.md" />

<!-- ❌ FORBIDDEN: copy of the same rule -->
<rule id="no_auto_commit" severity="CRITICAL">...</rule>
```

### 5.2 Minimal Attributes Principle

```xml
<!-- ✅ scope is obvious from <orchestrator> — don't duplicate -->
<orchestrator>
  <rule id="no_coding" severity="CRITICAL">...</rule>
</orchestrator>

<!-- ✅ scope is needed — rule is in a global container -->
<system-rules>
  <rule id="error_handling" severity="MANDATORY" scope="all">...</rule>
</system-rules>
```

### 5.3 Naming Conventions

| Aspect | Convention | Example |
|--------|-----------|---------|
| `id` | snake_case | `id="no_auto_commit"` |
| Tag names | kebab-case | `<system-rules>`, `<file-access>` |
| `scope` (agents) | camelCase | `scope="orchestrator"` |
| `scope` (paths) | glob | `scope="src/**"` |
| `severity` | UPPER_CASE | `severity="ABSOLUTE"` |
| Boolean attributes | lowercase strings | `autonomous="true"` |

---

## 6. File Templates

### Role file template

```xml
# [RoleName] Role

## Persona
<persona role="RoleName">
  <description>...</description>
  <attitude>...</attitude>
  <goal>...</goal>
</persona>

## Responsibilities & Permissions
<role-definition>
  <responsibilities>
    <item>...</item>
  </responsibilities>
  <permissions agent="RoleName">
    <file-access scope="src/**" mode="read-write" />
    <terminal allowed="true" commands="npm run *" />
    <delegation allowed="false" />
    <web-search allowed="false" />
  </permissions>
</role-definition>
```

### New rule template

```xml
<rule id="rule_name" severity="MANDATORY" scope="all">
  [Neutral imperative without MUST for MANDATORY] ...
</rule>

<rule id="rule_name" severity="CRITICAL" exception="none">
  The [Agent] MUST NOT [action]. [Justification].
</rule>

<rule id="rule_name" severity="ABSOLUTE">
  You MUST NEVER [action]. [Justification of irreversible consequences].
</rule>
```

---

## 7. Quotas and Limits

```
severity="ABSOLUTE"  ≤ 3 rules     (across the entire system)
severity="CRITICAL"  ≤ 10 rules    (total across all files)
severity="MANDATORY" — unlimited

Per role file: max 1 <persona> block + max 1 <permissions> block
Per phase:     max 2 <delegates-to> tags
```

---

## 8. When to Introduce a New Tag

A new tag is allowed only when **all three** conditions are met:
1. The existing vocabulary cannot express the required semantics
2. The tag will be used in **at least 2 different places** (otherwise it's an attribute, not a tag)
3. The decision is recorded as an ADR in `.agents/adr/`

---

## 9. Validation Checklist

When creating or editing any file under `.agents/`:

- [ ] Structure follows the template (section 6)
- [ ] All `<rule>` tags have `id` and `severity`
- [ ] Modal words correlate with severity (section 2)
- [ ] `ABSOLUTE` slot not exceeded (≤ 3 in system)
- [ ] `CRITICAL` slot not exceeded (≤ 10 in system)
- [ ] No rule duplication (Single Source of Truth)
- [ ] New tags documented via ADR
- [ ] Attributes do not duplicate parent tag context
- [ ] Tag names use kebab-case, `id` attribute uses snake_case
