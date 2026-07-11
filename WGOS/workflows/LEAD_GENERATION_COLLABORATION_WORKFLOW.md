# Lead Generation Collaboration Workflow

## Purpose

Coordinate compliant lead research, auditing, enrichment, CRM logging, outreach drafting, QA, documentation, and memory updates without sending outreach.

## Trigger

Use this workflow for a daily lead mission, campaign buildout, or prospecting sprint.

## Agents involved

- `MARKETING_STRATEGIST_AGENT`
- `LEAD_RESEARCH_AGENT`
- `WEBSITE_AUDIT_AGENT`
- `BUSINESS_INTELLIGENCE_AGENT`
- `CRM_AGENT`
- `OUTREACH_DRAFTING_AGENT`
- `QA_ENGINEER_AGENT`
- `KNOWLEDGE_MANAGER_AGENT`
- `DOCUMENTATION_AGENT`

## Step-by-step process

1. Marketing Strategist confirms target market, quality threshold, and quota.
2. Lead Research Agent finds and scores prospects using approved sources only.
3. Website Audit Agent creates a mini audit for each accepted lead.
4. Business Intelligence Agent enriches positioning, context, and personalization details.
5. CRM Agent logs status, ownership, and next-step state.
6. Outreach Drafting Agent creates a personalized draft for each approved lead.
7. QA Engineer validates compliance, personalization quality, and completeness.
8. Knowledge Manager records what was learned and what should improve next run.
9. Documentation Agent creates the mission report and handoff summary.

## Required inputs

- Mission brief
- Approved sources
- Lead scoring model
- Outreach rules

## Outputs

- Qualified leads
- Mini audits
- Personalized drafts
- CRM records
- Mission report

## Approval gates

- Pause before any email sending, form submission, or external contact.
- Pause at login, 2FA, CAPTCHA, verification, or billing steps in controlled browsing.

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

- Reject duplicate, low-quality, or weakly evidenced leads.
- Stop when browser access, source access, or approval is missing.

## Completion criteria

- Lead outputs are validated, documented, and handed off with no unauthorized contact action taken.
