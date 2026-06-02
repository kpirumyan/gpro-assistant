# ADR 010: Transition from Context Plugins to On-Demand RAG

## Context
The system was using an Antigravity plugin (`modern-web-guidance-plugin`) to automatically inject UI and CSS best practices into the agent's context. The plugin's README file was over 62KB (~18,800 tokens), consuming roughly 45% of the total system context on every single agent invocation. The vast majority of this information (like WebGL, Temporal API, Passkeys) was completely irrelevant to most backend, analytical, or generic tasks in the Next.js application.

## Decision
We removed the `modern-web-guidance-plugin` and migrated its entire knowledge base into an external AnythingLLM workspace (`web-guidance`). We introduced a new on-demand RAG script (`ask-web-guidance-rag.ts`) that the agent is explicitly instructed to query *only* when working on UI, layout, CSS, accessibility, or animation tasks.

## Consequences
- **Pros**: Massive reduction in token consumption (~18,800 tokens saved per request), leading to faster agent responses, smaller context windows, and significantly reduced cost/quota usage. Better separation of concerns between agent core logic and specific domain knowledge.
- **Cons**: UI knowledge is no longer implicitly or "magically" available; the agent must actively recognize when a task is UI-related and remember to query the RAG librarian before proceeding.
