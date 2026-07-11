# Integration Logging System

Every integration action should create a log entry with:

- time
- agent
- action
- result
- approval
- errors
- duration

## Logging rules

- Log successful observations and failed attempts
- Log approval pauses explicitly
- Log partial success instead of flattening it into pass/fail
- Keep secrets out of logs
