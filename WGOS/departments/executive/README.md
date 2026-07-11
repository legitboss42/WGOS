# Executive Department

## Summary

Mission intake, routing, approvals, governance, and executive reporting.

## Owned agents

- CEO Operator
- Workflow Orchestrator
- Project Manager
- Knowledge Manager
- Documentation Manager

## Mission types

- Mission intake
- Cross-department routing
- Weekly company review

## Owned integrations

- `filesystem`
- `docs`
- `csv`
- `github`

## Collaboration rules

- Routes company missions
- Escalates approvals
- Consumes KPI and risk outputs from every department

## Memory hooks

- `memory/company/`
- `memory/missions/`
- `memory/departments/executive/`

## Runtime references

- `runtime/core/AGENT_LIFECYCLE.md`
- `runtime/tasks/TASK_SYSTEM.md`
- `runtime/tasks/HANDOFF_PROTOCOL.md`
- `runtime/reporting/REPORT_STANDARD.md`
- `packages/runtime/src/mission-runtime.mjs`
- `packages/runtime/src/department-router.mjs`

## Department reporting duties

- Contribute mission-level report inputs.
- Update department report outputs after meaningful execution.
- Feed KPI and memory updates into company-wide records.

## Members

- CEO Operator
- Workflow Orchestrator
- Project Manager
- Knowledge Manager
- Documentation Manager
