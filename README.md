# Fringo

**Learn French on the go.** Adaptive reading and writing practice for TEF and TCF prep — short sessions, clear feedback, real progress.

---

## What is Fringo?

Fringo is a focused French learning app for people preparing for **TEF Canada** and **TCF**. You take a quick CEFR placement, then practice reading comprehension and written expression in sessions shaped to your level.

- **Reading** — exam-style MCQs across TEF sections, adapted to your CEFR band  
- **Writing** — structured prompts with AI evaluation and actionable feedback  
- **Notes & translate** — study pages and translation helpers built in  
- **Streaks & XP** — daily practice that stays visible and motivating  
- **Free + Pro** — start free with daily limits; upgrade for unlimited practice  

**Live stack:** Next.js client · Fastify API · MongoDB · OpenRouter (LLM) · Stripe (one-time Pro passes)

---

## Why we built it

Most French apps are either too generic (vocab drills with no exam context) or too heavy (full courses you never finish). We wanted something in the middle:

1. **Exam-first** — practice that feels like TEF/TCF, not random flashcards  
2. **Level-aware** — placement once, then sessions that match where you actually are  
3. **Daily-sized** — 10–20 minute sessions you can keep up with before test day  
4. **Honest feedback** — writing and reading scores that tell you what to fix next  

Fringo is the tool we wished existed while prepping: one place for placement, practice, notes, and progress — without juggling five apps.

---

## Project structure

```
fr-pipeline/
├── client/          # Next.js app (port 3000)
├── server/          # Fastify API (port 3001)
└── README.md
```

---

## Prerequisites

- **Node.js** 18+  
- **MongoDB** (Atlas or local)  
- **Google OAuth** client ID (Sign in with Google)  
- **OpenRouter** API key (LLM for reading/writing)  
- Optional: **Stripe** (Pro billing), **DeepL** (translate), **Serper** (web search)

---

## Environment setup

### 1. Server

Copy the example env and fill in your values:

```bash
cp server/.env.example server/.env
```

**Required for local dev:**

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `AUTH_SECRET` | Long random string for sessions |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `CLIENT_URL` | `http://localhost:3000` |
| `APP_URL` | `http://localhost:3000` |

**Optional but recommended:**

| Variable | Description |
|----------|-------------|
| `TEF_READING_USE_TEMPLATES=true` | Use built-in MCQ templates (saves LLM credits) |
| `TEF_WRITING_USE_TEMPLATES=true` | Use built-in writing prompts |
| `STRIPE_*` / `BILLING_*` | One-time Pro checkout (see [Stripe](#stripe-optional)) |
| `DEEPL_AUTH_KEY` | DeepL translate |
| `FREEMIUM_READING_PER_DAY` | Free tier reading limit (default `1`) |
| `FREEMIUM_WRITING_PER_DAY` | Free tier writing limit (default `1`) |

### 2. Client

```bash
cp client/.env.example client/.env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same Google client ID as server |

---

## Quick start

Clone and install dependencies:

```bash
git clone <your-repo-url>
cd fr-pipeline
```

Install server:

```bash
cd server
npm install
```

Install client:

```bash
cd ../client
npm install
```

Run the API (terminal 1):

```bash
cd server
npm run dev
```

Run the web app (terminal 2):

```bash
cd client
npm run dev
```

Open the app:

```text
http://localhost:3000
```

---

## Useful commands

**Server — development**

```bash
cd server && npm run dev
```

**Server — production build**

```bash
cd server && npm run build
cd server && npm start
```

**Server — typecheck**

```bash
cd server && npx tsc --noEmit
```

**Client — development**

```bash
cd client && npm run dev
```

**Client — production build**

```bash
cd client && npm run build
cd client && npm start
```

**Client — typecheck**

```bash
cd client && npx tsc --noEmit
```

---

## Stripe (optional)

Pro uses **one-time** Stripe Checkout (not subscriptions).

1. Create two **one-time** prices in [Stripe Dashboard](https://dashboard.stripe.com/products) (monthly pass + yearly pass).  
2. Copy each **Price ID** (`price_...`) into `server/.env`.  
3. Set display amounts with `BILLING_PRICE_MONTHLY` and `BILLING_PRICE_YEARLY`.  
4. Forward webhooks locally:

```bash
stripe listen --forward-to localhost:3001/api/billing/webhook
```

Paste the webhook signing secret into `STRIPE_WEBHOOK_SECRET` in `server/.env`.

---

## License

Private / all rights reserved — update this section if you open-source the repo.
