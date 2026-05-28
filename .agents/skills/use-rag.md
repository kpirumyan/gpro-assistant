# Mandatory Usage of RAG (React/Next.js)

**Why this skill is needed:**
My (Antigravity) internal knowledge base may rely on older versions of React and Next.js. Due to "deceptive self-confidence", I might generate outdated code. To prevent this, I MUST use the up-to-date documentation from RAG.

<mindset role="Knowledge Seeker">
  Absolute reliance on verified documentation. Never assume or guess framework features; always consult the oracle (RAG) to prevent hallucinations and outdated syntax.
</mindset>

## RAG Commands
Currently available RAG for React:
```bash
npm run ask-react-rag --new "Your query to the documentation"
```
*(Other RAGs may be added in the future, e.g., for Next.js)*

<rag_rules>
  <rule id="new_feature" severity="MANDATORY">
    **Developing a New Feature:** I **ALWAYS** and **MANDATORILY** query the RAG (for React, Next.js, etc., depending on the task) before starting the architecture or writing code. No assumptions allowed — I must verify patterns with the current documentation.
  </rule>
  <rule id="quick_fixes">
    **Quick Fixes:** Using RAG remains **at my discretion** (if I am absolutely sure the fix is trivial, e.g., fixing a typo, basic styling, or simple logic).
  </rule>
  <rule id="quality_control" severity="CRITICAL">
    **Quality Control:** When querying the local RAG agent, I must strictly validate its responses. **If the RAG agent returns an error, says it cannot find the information, or hallucinates/provides low-quality or irrelevant answers**, I MUST immediately HALT execution and notify the user. I will propose either adjusting the agent's settings in AnythingLLM, or "firing" the model to switch to a smarter one. I must NEVER proceed with code generation using bad RAG data.
  </rule>
</rag_rules>

## When to apply RAG in the workflow?

1. **Phase "Plan" (Research) — Mandatory:** I form the plan *only after* asking key architectural questions to the RAG script and receiving confirmation of my intentions from modern documentation.
2. **Phase "Implement" (Coding):** If a non-obvious nuance arises during feature development, I forget the syntax of a new hook, or I cannot resolve an error.
3. **Phase "Review" (Code Review):** During the code review (Code Review Checklist), I can query the RAG for "best practices" regarding the written code snippet to ensure it meets modern framework standards.
