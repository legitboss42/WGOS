# Blog Article Collaboration Workflow

## Purpose

Coordinate article production from search intent through writing, editing, linking, schema, QA, documentation, and memory updates.

## Trigger

Use this workflow for a new article, article refresh, or cluster-supporting editorial task.

## Agents involved

- `SEO_AGENT`
- `CONTENT_STRATEGIST_AGENT`
- `COPYWRITER_AGENT`
- `PROOFREADER_AGENT`
- `INTERNAL_LINKING_AGENT`
- `SCHEMA_AGENT`
- `QA_ENGINEER_AGENT`
- `DOCUMENTATION_AGENT`
- `KNOWLEDGE_MANAGER_AGENT`

## Step-by-step process

1. SEO Agent defines the target intent, keyword framing, metadata angle, and SERP constraints.
2. Content Strategist produces the brief, outline, and topical role within the wider cluster.
3. Copywriter drafts original people-first content.
4. Proofreader reviews clarity, grammar, factual consistency, and brand fit.
5. Internal Linking Agent connects the article to relevant services, related content, and conversion paths.
6. Schema Agent adds only schema that matches the visible content.
7. QA Engineer checks content quality, formatting, trust, and compliance.
8. Documentation Agent records the mission result and open follow-ups.
9. Knowledge Manager updates memory and future editorial priorities.

## Required inputs

- Mission brief
- Search intent target
- Existing content cluster context
- Internal linking opportunities

## Outputs

- Article package ready for review or implementation
- Validation evidence
- Documentation and memory updates

## Approval gates

- Pause before publishing content.
- Pause before making external claims not supported by evidence.

## Runtime references

- `runtime/core/AGENT_COMMUNICATION_PROTOCOL.md`
- `runtime/execution/EXECUTION_RULES.md`
- `runtime/tasks/TASK_SYSTEM.md`
- `runtime/tasks/HANDOFF_PROTOCOL.md`
- `packages/runtime/src/mission-runtime.mjs`
- `packages/runtime/src/mission-catalog.mjs`

## Documentation updates required

- Update `reports/`, `memory/`, `decisions/`, and `PROJECT_HANDOFF.md`.

## Failure handling

- Return weak, thin, duplicated, or inaccurate drafts for revision.
- Stop if required evidence, reviewer input, or approval is missing.

## Completion criteria

- The article package is validated, documented, and handed off with a clear publishing state.
