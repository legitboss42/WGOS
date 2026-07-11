# Failure Recovery

## Retry policy

- Retry only when the failure is transient and a second attempt will not create duplicate external effects.
- Do not retry actions that could send, publish, purchase, deploy, or mutate external systems without explicit approval.

## Rollback policy

- If local work introduced a bad state, document the issue and restore a safe local state when possible.
- Never hide failures by silently overwriting evidence.

## Partial completion

- If a task cannot finish, document what completed, what did not, and what is safe to reuse.

## Dependency failures

- If a dependency fails, mark the task BLOCKED or FAILED_QA as appropriate and route the problem to the correct owner.

## Human escalation

- Escalate when approval is required, when data is ambiguous, or when risk exceeds the current agent's authority.
