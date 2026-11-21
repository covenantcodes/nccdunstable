# New Covenant Church Dunstable

Independent React 18, TypeScript, Vite and Tailwind website for NCC Dunstable. The visual system follows the source NCCWW project's Jost typography, blue/purple palette, fixed navigation and church focused layout. Church specific details are centralized in `src/config.ts`.

## Local setup

1. Install Node.js (20 or newer recommended).
2. Copy `.env.example` to `.env.local` and add the values from the dedicated NCC Dunstable Firebase project.
3. Run `npm install`, then `npm run dev` and open the local URL printed by Vite.

Without Firebase values, public pages still render and display a setup message where data is needed. Contact submissions and giving intentions require Firestore.

## Firebase project setup

Create a **separate** Firebase project for New Covenant Church Dunstable. Register a web app and copy its client configuration into `.env.local`. Enable Email/Password Authentication, create an administrator user in Firebase Authentication, create a Firestore database, and enable Firebase Storage. The root `firebase.json` points to `firestore.rules` and `storage.rules`.

### Deploy Firebase rules

1. Install and sign in to the Firebase CLI, then select the NCC Dunstable project with `firebase use --add`.
2. Deploy the rules with `firebase deploy --only firestore:rules,storage`.
3. In Firebase Authentication, create the admin user and copy its UID.
4. In Firestore, create an `admins` collection document whose document ID is that UID. A small document such as `{ "role": "admin" }` is enough. Admin membership is based on the document's existence; client users cannot create or change these documents.

The rules allow anyone to read the `sermons`, `events`, and `ministries` collections because the public pages currently display every document in them. Only approved admin UIDs can write those collections or upload their images. Visitors can create contact messages and giving intentions, but only admins can read or modify those submissions. Giving records are intentions only; they do not process payments.

Keep Firestore and Storage rules deployed before using the admin area or public forms. The site's client checks are not a substitute for these rules.

Required environment variables:

| Variable | Firebase web app value |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |

The public client configuration is not a service account credential. Never put private keys or service account JSON in Vite variables.

## Firestore collections

- `sermons`: title, description, date, speaker, optional `imageUrl`, and `createdAt`.
- `events`: title, description, date, optional `imageUrl`, and `createdAt`.
- `ministries`: title, description, optional `imageUrl`, and `createdAt`.
- `messages`: name, email, subject, message, createdAt, status.
- `donations`: amount, currency, name, email, note, createdAt, status. Current flow records a giving intention and does not accept payment.
- `settings`: reserved for future site configuration.

Content pages show loading, empty, setup, and Firestore error states. Admin supports Firebase email/password login, a dashboard, add/edit forms for sermons, events, and ministries, a contact-message inbox with read status, and a list of giving intentions. Admin users must also have a document in `admins` whose ID matches their Firebase Authentication UID.

## Media uploads

The supplied NCC Dunstable logo is in `public/images/ncc-dunstable-logo.jpg`. Admin content forms support image URL entry or direct upload to this project's Firebase Storage. Configure Storage rules before enabling admin uploads. Do not reuse NCCWW credentials.

## Donations

Payments are not active. The Give page clearly explains the unconfigured state and offers an optional intention form that saves a record to `donations` without charging anyone. Once approved details are available, configure a payment provider such as Stripe or Paystack through a server-side integration; do not put secret payment keys in browser environment variables. Add church approved bank instructions to `src/config.ts` or a settings document.

## Branding and placeholders

Update `src/config.ts` with the confirmed Dunstable address, phone, email, service times and social profile links. Values in square brackets and `#` social links are placeholders. They are deliberately not copied from NCCWW.

## Build and deployment

Run `npm run lint` and `npm run build`. Deploy the generated `dist` directory to a static host with SPA fallback/rewrite to `index.html`. Configure the six Firebase variables in the hosting environment. For Vercel, the included `vercel.json` provides SPA routing.
# nccdunstable
