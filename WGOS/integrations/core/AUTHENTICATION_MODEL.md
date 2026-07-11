# Authentication Model

Authentication rules for WGOS integrations:

- never request passwords in chat
- never expose secrets in code or docs
- pause at login, 2FA, CAPTCHA, billing, verification, property selection, or account selection
- record whether access was confirmed, not assumed
- distinguish between attached session capability and theoretical provider support

## Authentication states

- AVAILABLE
- WAITING_LOGIN
- WAITING_APPROVAL
- BLOCKED

## Rule

An integration may only claim authenticated access when the active session can actually reach the protected surface.
