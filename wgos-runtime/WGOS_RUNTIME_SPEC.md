# WGOS Runtime Spec

The runtime bridge converts a plain Codex instruction into a mission plan.

## Flow

1. Read runtime bridge docs.
2. Read existing WGOS memory and current state.
3. Classify the objective.
4. Select mission type, workflow, agents, skills, approval gates, reports, and memory updates.
5. Create a task board.
6. Execute phase by phase inside Codex.
7. Pause for approvals.
8. Generate reports.
9. Update memory and documentation.
