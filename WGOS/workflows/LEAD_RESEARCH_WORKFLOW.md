# Lead Research Workflow

## Purpose

Find 50 qualified leads and create 50 personalized drafts without sending any outreach automatically.

## Trigger

The marketing team needs qualified leads and audit-ready outreach opportunities.

## Agents involved

- Marketing Strategist Agent
- Lead Research Agent
- Website Audit Agent
- Business Intelligence Agent
- Outreach Drafting Agent
- CRM Agent
- Follow Up Agent
- Social Media Agent
- Newsletter Agent
- CRO Agent
- AdSense Agent
- Affiliate Manager Agent
- Digital Product Agent
- SaaS Planner Agent
- Analytics Agent
- Revenue Operations Agent

## Step-by-step process

1. Human starts the mission and confirms target market if needed.
2. CEO Operator interprets the lead goal and confirms quota, quality bar, and priorities.
3. Workflow Orchestrator routes work to Lead Research, Website Audit, Business Intelligence, Outreach Drafting, QA, CRM, Knowledge Manager, and Documentation Agent.
4. Project Manager creates the task board with quota checkpoints and validation gates.
5. Lead Research Agent searches approved sources and saves only leads scoring 60+.
6. Website Audit Agent creates a mini audit for each accepted lead.
7. Business Intelligence Agent enriches context needed for better personalization and fit decisions.
8. Outreach Drafting Agent writes one personalized draft per accepted lead.
9. QA Agent checks lead quality, compliance, personalization, and completion count.
10. CRM Agent logs lead status and draft readiness.
11. Knowledge Manager updates memory and open risks.
12. Documentation Agent writes the mission report and handoff summary.
13. Human reviews drafts and decides what, if anything, will be sent manually.
14. Follow Up Agent prepares later follow-up drafts only after human direction.

## Required inputs

- Lead mission
- target locations
- target industries
- approved sources
- scoring model

## Outputs

- 50 qualified leads
- 50 mini audits
- 50 outreach angles
- 50 personalized drafts
- CRM-ready logs
- mission report

## Approval gates

- Human approval required for any Gmail draft creation if explicitly requested
- Human approval required for any sending, contact form submission, or external outreach action

## Runtime references

- `runtime/core/AGENT_COMMUNICATION_PROTOCOL.md`
- `runtime/execution/EXECUTION_RULES.md`
- `runtime/tasks/TASK_SYSTEM.md`
- `runtime/tasks/HANDOFF_PROTOCOL.md`
- `runtime/approval/APPROVAL_REQUEST_FORMAT.md`
- `packages/runtime/src/mission-runtime.mjs`
- `packages/runtime/src/mission-catalog.mjs`
- `packages/runtime/src/state-store.mjs`

## Documentation updates required

- Update the mission report in `reports/`.
- Update `memory/CODEX_MEMORY.md`, `memory/CURRENT_STATE.md`, `memory/ACTIVE_TASKS.md`, and `memory/NEXT_ACTIONS.md`.
- Update `decisions/DECISIONS.md` when the workflow causes a durable operating decision.
- Update `PROJECT_HANDOFF.md` when the workflow pauses or passes work forward.

## Failure handling

- If fewer than 50 qualified leads are found, document the exact shortage and why.
- If source quality drops below threshold, change search formulas before accepting weak leads.
- If personalization cannot be verified, reject the draft and return it for rewrite.

## Completion criteria

- Required outputs exist and are reviewable.
- QA or equivalent validation has run where appropriate.
- Memory and documentation updates are complete.
- Any approval-dependent next step is explicitly handed to the human owner.
