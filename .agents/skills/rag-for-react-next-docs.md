# Mandatory Usage of RAG (React & Next.js)

**Why this skill is needed:**
My (Antigravity) internal knowledge base may rely on older versions of React and Next.js. Due to "deceptive self-confidence", I might generate outdated code. To prevent this, I MUST use the up-to-date documentation from RAG.

<mindset role="Knowledge Seeker">
  Absolute reliance on verified documentation. Never assume or guess framework features; always consult the oracle (RAG) to prevent hallucinations and outdated syntax.
</mindset>

## RAG Commands

Currently available RAGs:

### React Docs
```bash
# IMPORTANT: On Windows Git Bash, you MUST use `--` before arguments with spaces 
# so that npm doesn't strip quotes, OR use npx tsx directly!
npm run ask-react-rag -- --new "Your query to the documentation"
# OR
npx tsx scripts/ask-react-rag.ts --new "Your query to the documentation"
```

### Next.js Docs
```bash
npm run ask-next-rag -- --new "Your query to the Next.js App Router documentation"
# OR
npx tsx scripts/ask-next-rag.ts --new "Your query to the Next.js App Router documentation"
```

### Modern Web Guidance (UI & CSS Best Practices)
```bash
npm run ask-web-guidance-rag -- --new "Your UI/CSS query (e.g. how to style custom scrollbars, or animate dialogs)"
# OR
npx tsx scripts/ask-web-guidance-rag.ts --new "Your UI/CSS query"
```
**RULE:** If the task is related to UI, layout, CSS, accessibility, or web animations → ALWAYS ask `ask-web-guidance-rag` FIRST.

<rag_rules>
  <rule id="mandatory_rag_query" severity="CRITICAL">
    **Mandatory RAG Consultation:** I **MUST NEVER** rely on my own training data or prior experience when modifying, creating, or refactoring React or Next.js code. I **ALWAYS** query the RAG (for React or Next.js depending on the task) before writing any code. The ONLY exception is fixing trivial typos or syntax errors (like missing commas or brackets).
  </rule>
  <rule id="no_self_reliance" severity="CRITICAL">
    **No Deceptive Self-Confidence:** Relying on my own experience or assuming standard framework behavior is a critical failure. If I plan to write or edit code, I must first query the RAG librarian to verify the current API and conventions. I will not assume any code is "too simple" to skip this step.
  </rule>
  <rule id="quality_control" severity="CRITICAL">
    **Quality Control:** When querying the local RAG agent, I must strictly validate its responses. **If the RAG agent returns an error, says it cannot find the information, or hallucinates/provides low-quality or irrelevant answers**, I MUST immediately HALT execution and notify the user. I will propose either adjusting the agent's settings in AnythingLLM, or "firing" the model to switch to a smarter one. I must NEVER proceed with code generation using bad RAG data.
  </rule>
  <rule id="language" severity="MANDATORY">
    **Language:** I must ALWAYS communicate with the RAG (the "librarian") in English. All queries passed to the `--new` flag must be formulated in English to ensure the highest quality of search and response from the documentation.
  </rule>
  <rule id="follow_rag_links" severity="CRITICAL">
    **Follow RAG Links:** If the RAG response provides external URLs, documentation links, or references to specific guides containing the implementation details, I **MUST** use the `read_url_content` tool to fetch and read the full contents of those URLs before generating or modifying any code. I must never assume the contents of the linked documentation based only on the short summary.
  </rule>
</rag_rules>

## When to apply RAG in the workflow?

1. **Phase "Plan" (Research) — Mandatory:** I form the plan *only after* asking key architectural questions to the RAG script and receiving confirmation of my intentions from modern documentation.
2. **Phase "Implement" (Coding):** If a non-obvious nuance arises during feature development, I forget the syntax of a new hook, or I cannot resolve an error.
3. **Phase "Review" (Code Review):** During the code review (Code Review Checklist), I can query the RAG for "best practices" regarding the written code snippet to ensure it meets modern framework standards.
