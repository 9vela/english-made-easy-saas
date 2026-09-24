# English Made Easy — v4

Persistent PostgreSQL version with four learning levels.

## Learning path
- Level 1 — Basic English: 8 chapters, 2 tests (checkpoint after the first 3 free chapters + final test), pronunciation, certificate.
- Level 2 — Practical English: 10 chapters, 3 tests, pronunciation, certificate.
- Level 3 — Professional English: 10 chapters, 3 tests, pronunciation, certificate.
- Level 4 — Advanced English: 10 chapters, 3 tests, pronunciation, certificate.

A level unlocks only after the previous level's chapters are completed and all required tests are passed. New users can see all levels immediately, but locked levels are clearly shown.

## Included
- PostgreSQL persistence for users, sessions, courses, lessons, progress, tests, attempts, certificates, pronunciation attempts, shares and country pricing.
- Country-specific currency/pricing.
- Admin pricing editor and basic statistics.
- Share prompt after chapter 1.
- Browser microphone practice using Web Speech API. This MVP checks what the browser recognized; it is not a professional phonetic/accent assessment.
- Demo Premium upgrade only. Real payment processing still needs a payment provider and verified webhooks.

## Render environment variables
- `DATABASE_URL` = Render PostgreSQL Internal Database URL.
- `ADMIN_EMAIL` = your admin email.
- `ADMIN_PASSWORD` = a strong admin password.

## Important
The PostgreSQL Free instance shown in Render may expire/delete according to Render's current free-plan policy. For a real production business, use a paid/persistent database plan and backups before relying on it for customer data.
