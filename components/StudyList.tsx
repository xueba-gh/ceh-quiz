"use client";

import { useMemo, useState } from "react";
import type { Question } from "@/lib/questions";

export default function StudyList({ questions }: { questions: Question[] }) {
  const [query, setQuery] = useState("");
  const [showAnswers, setShowAnswers] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (item) =>
        String(item.id) === q ||
        item.question.toLowerCase().includes(q) ||
        item.options.some((o) => o.text.toLowerCase().includes(q)) ||
        item.explanation.toLowerCase().includes(q),
    );
  }, [query, questions]);

  return (
    <section>
      <h1>Study guide</h1>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Search questions, answers, or a question number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="check">
          <input type="checkbox" checked={showAnswers} onChange={(e) => setShowAnswers(e.target.checked)} />
          Show answers
        </label>
      </div>
      <p className="muted">{filtered.length} questions</p>

      {filtered.map((q) => (
        <article key={q.id} className="card">
          <div className="card-meta">
            <span>Q{q.id}</span>
            {showAnswers && q.disputed && <span className="badge">Disputed answer</span>}
          </div>
          <p className="stem">{q.question}</p>
          <ul className="options static">
            {q.options.map((o) => (
              <li key={o.key} className={showAnswers && o.key === q.answer ? "correct" : ""}>
                <span className="key">{o.key}</span>
                <span className="text">{o.text}</span>
              </li>
            ))}
          </ul>
          {showAnswers && (
            <div className="explain ok">
              <strong>Answer: {q.answer}</strong>
              <p>{q.explanation}</p>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
