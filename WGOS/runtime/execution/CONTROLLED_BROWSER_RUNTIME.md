# Controlled Browser Runtime

Browser lifecycle:

1. Open Session
2. Navigate
3. Wait For Human Login
4. Resume
5. Collect Information
6. Generate Report
7. Close Session

## Hard rules

- Never bypass login.
- Never bypass CAPTCHA.
- Never expose credentials.
- Never continue after an approval gate.
- Pause at login, 2FA, billing, verification, CAPTCHA, property selection, or account selection.
- Record only confirmed facts from the observed session.
