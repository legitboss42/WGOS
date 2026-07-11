# Integration Approval Model

## Levels

- LOW: local parsing or offline processing only
- NORMAL: safe read-only local or cached work
- HIGH: authenticated read-only portal or connector access
- CRITICAL: any state-changing external action

## Required pauses

- login
- 2FA
- CAPTCHA
- billing
- verification
- property selection
- account selection
- DNS or production changes

## Rule

CRITICAL always pauses and HIGH pauses whenever the session boundary is unclear.
