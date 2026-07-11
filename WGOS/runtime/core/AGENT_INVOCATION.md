# Agent Invocation Framework

Every invocation must include:

- Mission ID
- Task ID
- Calling Agent
- Target Agent
- Objective
- Context
- Required Inputs
- Expected Outputs
- Approval Requirements
- Success Criteria

## Invocation rules

- Invocation must be written before work starts.
- The target agent must reject tasks with missing mandatory fields.
- If context is insufficient, the target agent must request clarification or log the blocker.
- If the task is risky, approval requirements must be explicit before execution continues.
