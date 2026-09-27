# CEH Practice Test

A Next.js app for practicing Certified Ethical Hacker (CEH) exam questions. It has 398 multiple-choice questions, and each one comes with an answer and a short explanation. The app is behind a login.

## Features

- **Practice mode**: the correct answer and explanation appear as soon as you pick an option.
- **Exam mode**: answer everything first, then see your score and review the questions you missed.
- **Exam timer**: optional countdown at real exam pace (125 questions in 4 hours). The exam submits itself when time runs out.
- **Topics**: every question is tagged with a CEH topic (Cryptography, Web Apps, Wireless, …). You can quiz or study one topic at a time.
- **Flag and jump**: flag questions to come back to, and use the question grid to jump to any question.
- **Resume**: an unfinished quiz is saved, so a refresh or closing the phone app doesn't lose it.
- **Recent scores**: your last results are shown on the start screen.
- **Keyboard shortcuts**: A–D or 1–4 to answer, ← → to move, F to flag.
- Choose how many questions to take and whether to shuffle them.
- **Retry wrong answers**: questions you miss are remembered so you can quiz on just those.
- **Study guide** (`/study`): every question with its answer, plus search and a topic filter.

Progress (wrong answers, scores, a quiz in progress) is stored in your browser, so it's per device.
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
