# CEH Practice Test

A Next.js app for practicing Certified Ethical Hacker (CEH) exam questions. It has 398 multiple-choice questions, and each one comes with an answer and a short explanation. The app is behind a login.

## Features

- **Practice mode**: the correct answer and explanation appear as soon as you pick an option.
- **Exam mode**: answer everything first, then see your score and review the questions you missed.
- Choose how many questions to take (10, 25, 50, 125 or all) and whether to shuffle them.
- **Retry wrong answers**: questions you miss are saved in your browser (localStorage) so you can quiz on just those.
- **Study guide** (`/study`): every question with its answer, plus search.
- About ten questions are marked **Disputed answer** because answer keys online disagree on them. Double-check those against the official courseware.

## Login setup

The login uses three environment variables (see `.env.example`):

| Variable | What it is |
| --- | --- |
| `AUTH_USERNAME` | The username you log in with |
| `AUTH_PASSWORD` | The password you log in with |
| `SESSION_SECRET` | A long random string that signs the login cookie |

Until all three are set, the login page shows "Login isn't set up yet". A login lasts 30 days, and **Log out** in the header ends it early.

## Getting started

Copy `.env.example` to `.env.local` and fill in the three values. Then run:

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Install on your phone

The site is a web app you can add to your home screen, where it opens full screen like a normal app:

- **iPhone (Safari)**: tap Share, then **Add to Home Screen**.
- **Android (Chrome)**: tap the ⋮ menu, then **Install app** (or **Add to Home screen**).

## Editing questions

All questions live in [`data/questions.json`](data/questions.json):

```json
{
  "id": 1,
  "question": "…",
  "options": [{ "key": "A", "text": "…" }],
  "answer": "C",
  "explanation": "…",
  "disputed": true
}
```

## Deploying

No `vercel.json` is needed. Vercel detects Next.js automatically.

1. On vercel.com, choose **Add New → Project** and import this repo.
2. Under **Environment Variables**, add `AUTH_USERNAME`, `AUTH_PASSWORD` and `SESSION_SECRET`.
3. Click **Deploy**.

If you change a variable later, redeploy so the change takes effect.
