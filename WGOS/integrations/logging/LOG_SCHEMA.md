# Integration Log Schema

Every integration event should record:

- time
- mission_id
- task_id
- agent
- integration
- action
- capability_state
- result
- approval
- duration
- errors
- evidence_pointer

## Rule

If an action cannot be evidenced, log the failure or uncertainty instead of a false success.
