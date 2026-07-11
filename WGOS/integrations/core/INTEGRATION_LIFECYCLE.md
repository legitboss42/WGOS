# Integration Lifecycle

Every integration follows this lifecycle:

1. Load capability definition
2. Check approval class
3. Confirm authentication state
4. Execute allowed read-only or approved action
5. Capture evidence
6. Write logs
7. Generate report output
8. Update memory and handoff records

## Rule

If authentication, approval, or session capability is missing, the lifecycle pauses instead of guessing.
