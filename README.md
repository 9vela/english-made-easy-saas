# English Made Easy — SaaS MVP v2

## Premium plans
- Weekly — $2 / 7 days
- Monthly — $5 / 30 days
- Annual — $40 / 365 days

> Prices are placeholders and the checkout is still DEMO. No real payment is collected.

## Run locally
1. Install Node.js.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Publish online with Render
This project is prepared for a Node/Express Web Service. Render supports Node.js/Express and can deploy from a connected Git repository. Use:
- Build Command: `npm install`
- Start Command: `npm start`
- Runtime: Node

For a real production SaaS, replace the in-memory data with a persistent database. Render notes that its default filesystem is ephemeral, so user/payment data should use a managed datastore or other persistent database.

### GitHub + Render
1. Create a GitHub repository.
2. Upload all project files to the repository.
3. In Render, create **New → Web Service** and connect the repository.
4. Set Build Command to `npm install` and Start Command to `npm start`.
5. Deploy. Render will provide an `onrender.com` address.
6. Later, connect a custom domain.

## Still required before accepting real payments
- Persistent database (PostgreSQL recommended for production)
- Secure password hashing and stronger session management
- Real payment provider and webhook verification
- HTTPS, email verification and password reset
- Admin dashboard
- Terms, privacy policy and refund/cancellation rules
- Production monitoring/backups
