# CEH Practice Test

A Next.js app for practicing Certified Ethical Hacker (CEH) exam questions. It has 396 multiple-choice questions, and each one comes with an answer and a short explanation.

## Features

- **Practice mode**: the correct answer and explanation appear as soon as you pick an option.
- **Exam mode**: answer everything first, then see your score and review the questions you missed.
- Choose how many questions to take (10, 25, 50, 125 or all) and whether to shuffle them.
- **Retry wrong answers**: questions you miss are saved in your browser (localStorage) so you can quiz on just those.
- **Study guide** (`/study`): every question with its answer, plus search.
- About ten questions are marked **Disputed answer** because answer keys online disagree on them. Double-check those against the official courseware.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

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

The app is fully static, so it deploys to Vercel with no configuration: import the repo and click Deploy.
