# English Made Easy — v5

Persistent PostgreSQL SaaS for learning English.

## Learning path
- Level 1 — Basic English: 8 chapters, **2 tests** (checkpoint + final), alphabet A–Z, numbers 1–20, audio pronunciation, microphone practice and certificate.
- Level 2 — Practical English: 10 chapters, **3 tests**, pronunciation and certificate.
- Level 3 — Professional English: 10 chapters, **3 tests**, pronunciation and certificate.
- Level 4 — Advanced English: 10 chapters, **3 tests**, pronunciation and certificate.

A level unlocks after the previous level's chapters are completed and all required tests are passed. New users can see the future levels but locked levels cannot be opened yet.

## v5 improvements
- Full A–Z alphabet with Portuguese reading approximations.
- **🔊 Listen** button uses browser text-to-speech; it does not require a microphone.
- **🎙️ Practice** button uses the browser Web Speech API for microphone practice.
- Numbers 1–20 and useful everyday phrases have listen/practice controls.
- Basic English includes an example story using the requested names: Hermano Novela, Agostinho P, Constancia Ofiço, Aunora Wanicela, Dario, Tionildo, Ofiço, Jerry, Clerio, Aila, Celsa, Lourena and Oaldo.
- Test answer positions are deliberately varied (A/B/C) instead of always putting the correct answer first.
- Referral system: every user receives a referral link. **5 successful sign-ups = one 5% discount reward** for the next Premium purchase. Rewards can repeat at 10, 15, etc.
- Admin dashboard can update country prices and edit course settings, lessons, pronunciation data and tests.
- PostgreSQL stores users, sessions, courses, lessons, progress, tests, attempts, certificates, pricing, pronunciation attempts, shares and referral rewards.

## Render environment variables
- `DATABASE_URL` = Render PostgreSQL **Internal Database URL**.
- `ADMIN_EMAIL` = your admin email.
- `ADMIN_PASSWORD` = a strong admin password.

## Important
- The current Premium upgrade is still **DEMO**. It changes Premium access in the database but does not charge money.
- The referral 5% discount is also recorded/applied in the demo flow. A real payment provider must calculate and enforce the discount server-side through its checkout/webhook system.
- Browser speech recognition checks what the browser understood. It is **not** a professional phonetic/accent score.
- For production, use a persistent paid database plan, backups, secure admin sessions, HTTPS, email verification/password reset, rate limiting, monitoring and a real payment provider with verified webhooks.
