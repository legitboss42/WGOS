# Mission Routing Playbook

## Used by

- Workflow Orchestrator
- Project Manager

## Integrations

- docs
- filesystem
- csv

## Steps

1. Load mission template and runtime state.
2. Map specialists, dependencies, and approvals.
3. Assign only the integrations each specialist is allowed to use.
4. Write handoff-safe task sequencing.
5. Persist routing output to reports and state.
