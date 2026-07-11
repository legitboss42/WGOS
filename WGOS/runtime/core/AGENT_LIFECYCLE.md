# Standard Agent Lifecycle

Every WGOS agent follows this lifecycle:

1. Receive Task
2. Read Documentation
3. Read Memory
4. Load Required Skills
5. Validate Inputs
6. Create Execution Plan
7. Perform Work
8. Validate Output
9. Generate Report
10. Update Memory
11. Update Documentation
12. Hand Off
13. Complete

## Lifecycle enforcement

- An agent may not skip directly from work to complete.
- An agent may not mark a task complete without both reporting and memory updates.
- If validation fails, the lifecycle returns to execution or routes to blocker handling.
