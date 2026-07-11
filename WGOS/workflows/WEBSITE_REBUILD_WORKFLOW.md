# Website Rebuild Workflow

## Purpose

Define the repeatable process, approvals, and handoffs for this class of WGOS mission.

## Trigger

A website needs redesign, re-platforming, or major structural improvement.

## Agents involved

- CEO Operator Agent
- Workflow Orchestrator Agent
- Project Manager Agent
- Knowledge Manager Agent
- Documentation Manager Agent
- Product Strategist Agent
- UI UX Designer Agent
- Brand Designer Agent
- Motion Graphics Designer Agent
- Frontend Engineer Agent
- Backend Engineer Agent
- Full Stack Engineer Agent
- Performance Engineer Agent
- Accessibility Engineer Agent
- QA Engineer Agent
- Deployment Engineer Agent
- SEO Agent
- Technical SEO Agent
- AEO Agent
- GEO Agent
- Schema Agent
- Search Console Agent
- Editorial Manager Agent
- Content Strategist Agent
- Copywriter Agent
- Proofreader Agent
- Internal Linking Agent

## Step-by-step process

1. Receive the trigger and confirm the mission objective.
2. Route the work to the appropriate specialists.
3. Execute the task sequence with approval pauses where needed.
4. Validate outputs before completion.
5. Update memory, reports, and handoff records.

## Required inputs

- Mission brief
- relevant company context
- required source files or systems

## Outputs

- Validated workflow outputs
- report
- memory updates
- handoff notes

## Approval gates

- Pause for any externally visible, state-changing, or account-modifying action
- Pause for login, 2FA, CAPTCHA, billing, verification, or property-selection steps

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

- Stop and document blockers instead of improvising around missing inputs or approvals.
- Return failed outputs to the correct specialist instead of silently accepting poor quality.
- Escalate ambiguous risk to the human owner through the orchestrator or project manager.

## Completion criteria

- Required outputs exist and are reviewable.
- QA or equivalent validation has run where appropriate.
- Memory and documentation updates are complete.
- Any approval-dependent next step is explicitly handed to the human owner.
