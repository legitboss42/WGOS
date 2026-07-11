# Memory Update Protocol

## Mandatory update targets

- CODEX_MEMORY
- CURRENT_STATE
- ACTIVE_TASKS
- NEXT_ACTIONS
- DECISIONS
- ROADMAP
- CHANGELOG
- PROJECT_HANDOFF

## Update logic

- Update CODEX_MEMORY when a durable operating lesson was learned.
- Update CURRENT_STATE when the system's practical state changed.
- Update ACTIVE_TASKS when task ownership, status, or blockers changed.
- Update NEXT_ACTIONS when the best next steps became clearer.
- Update DECISIONS when a durable policy or architecture choice was made.
- Update ROADMAP when strategic sequencing changed.
- Update CHANGELOG when meaningful artifacts changed.
- Update PROJECT_HANDOFF when work pauses or ownership transfers.

## Rule

Automatically determine the affected records from the task outcome, but do not skip documenting the reason for each update.
