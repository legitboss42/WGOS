# Agent Communication Protocol

Every WGOS communication must use one of these message types:

- TASK
- STATUS
- REPORT
- HANDOFF
- REQUEST
- APPROVAL
- WARNING
- ERROR
- COMPLETE

## Protocol rules

- TASK starts work.
- STATUS communicates progress without closing the task.
- REPORT captures what was actually done.
- HANDOFF transfers ownership with context.
- REQUEST asks for missing inputs or clarification.
- APPROVAL pauses for human permission.
- WARNING flags non-blocking risk.
- ERROR records blocking failure.
- COMPLETE is used only after validation, memory, and documentation are done.
