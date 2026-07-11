# Local Secrets Store

Local development credentials may live at:

```text
wgos-runtime/secrets/credentials.local.json
```

This file is gitignored.

Use app passwords, API tokens, OAuth credentials, service accounts, limited-permission accounts, and test accounts instead of primary account passwords.

Never expose credentials in console logs, reports, markdown docs, memory files, prompts, commits, or error messages.
