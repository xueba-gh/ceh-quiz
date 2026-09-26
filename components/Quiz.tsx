"use client";

import { useEffect, useMemo, useState } from "react";
import type { Question } from "@/lib/questions";
import QuestionCard from "./QuestionCard";

type Mode = "practice" | "exam";
type Phase = "setup" | "running" | "results";

const MISSED_KEY = "ceh-missed";

function loadMissed(): number[] {
  try {
    return JSON.parse(localStorage.getItem(MISSED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveMissed(ids: number[]) {
  try {
    localStorage.setItem(MISSED_KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable (private mode etc.) — progress just isn't remembered
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz({ questions }: { questions: Question[] }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<Mode>("practice");
  const [count, setCount] = useState(25);
  const [randomize, setRandomize] = useState(true);
  const [missedOnly, setMissedOnly] = useState(false);
  const [missed, setMissed] = useState<number[]>([]);

  const [deck, setDeck] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser-only storage after hydration
    setMissed(loadMissed());
  }, []);

  const pool = useMemo(
    () => (missedOnly ? questions.filter((q) => missed.includes(q.id)) : questions),
    [missedOnly, missed, questions],
  );

  function start() {
    const ordered = randomize ? shuffle(pool) : pool;
    setDeck(ordered.slice(0, Math.min(count, ordered.length)));
    setIndex(0);
    setAnswers({});
    setPhase("running");
  }

  function choose(key: string) {
    const q = deck[index];
    if (mode === "practice" && answers[q.id]) return;
    setAnswers((prev) => ({ ...prev, [q.id]: key }));
  }

  function finish() {
    const next = new Set(missed);
    for (const q of deck) {
      const a = answers[q.id];
      if (!a) continue;
      if (a === q.answer) next.delete(q.id);
      else next.add(q.id);
    }
    const list = [...next].sort((a, b) => a - b);
    setMissed(list);
    saveMissed(list);
    setPhase("results");
  }

  if (phase === "setup") {
    return (
      <section className="panel">
        <h1>CEH practice test</h1>
        <p className="muted">
          {questions.length} questions, each with an answer and explanation. Practice mode shows the
          answer right away. Exam mode shows your score at the end.
        </p>

        <div className="field">
          <span className="label">Mode</span>
          <div className="segmented">
            {(["practice", "exam"] as Mode[]).map((m) => (
              <button
                key={m}
                className={mode === m ? "active" : ""}
                onClick={() => setMode(m)}
                type="button"
              >
                {m === "practice" ? "Practice" : "Exam"}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="count">
            Number of questions
          </label>
          <select id="count" value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {[10, 25, 50, 125, questions.length].map((n) => (
              <option key={n} value={n}>
                {n === questions.length ? `All (${n})` : n}
              </option>
            ))}
          </select>
          <span className="hint">The real CEH exam has 125 questions in 4 hours.</span>
        </div>

        <label className="check">
          <input type="checkbox" checked={randomize} onChange={(e) => setRandomize(e.target.checked)} />
          Shuffle questions
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={missedOnly}
            disabled={missed.length === 0}
            onChange={(e) => setMissedOnly(e.target.checked)}
          />
          Only questions I got wrong ({missed.length})
        </label>

        <div className="actions">
          <button className="primary" onClick={start} disabled={pool.length === 0} type="button">
            Start
          </button>
          {missed.length > 0 && (
            <button
              className="ghost"
              type="button"
              onClick={() => {
                setMissed([]);
                saveMissed([]);
                setMissedOnly(false);
              }}
            >
              Clear wrong-answer history
            </button>
          )}
        </div>
      </section>
    );
  }

  if (phase === "results") {
    const answered = deck.filter((q) => answers[q.id]);
    const correct = deck.filter((q) => answers[q.id] === q.answer).length;
    const pct = deck.length ? Math.round((correct / deck.length) * 100) : 0;
    const wrong = deck.filter((q) => answers[q.id] !== q.answer);

    return (
      <section>
        <div className="panel results">
          <h1>{pct}%</h1>
          <p>
            {correct} of {deck.length} correct
            {answered.length < deck.length && ` (${deck.length - answered.length} unanswered)`}.
            {" "}
            {pct >= 70 ? "That's at or above the usual ~70% passing mark." : "The passing mark is usually around 70%."}
          </p>
          <div className="actions">
            <button className="primary" type="button" onClick={() => setPhase("setup")}>
              New quiz
            </button>
          </div>
        </div>

        {wrong.length > 0 && (
          <>
            <h2 className="section-title">Review ({wrong.length})</h2>
            {wrong.map((q) => (
              <QuestionCard key={q.id} question={q} selected={answers[q.id]} revealed />
            ))}
          </>
        )}
      </section>
    );
  }

  const q = deck[index];
  const selected = answers[q.id];
  const revealed = mode === "practice" && !!selected;
  const answeredCount = Object.keys(answers).length;

  return (
    <section>
      <div className="progress-row">
        <span>
          Question {index + 1} / {deck.length}
        </span>
        <span className="muted">{answeredCount} answered</span>
      </div>
      <div className="progress">
        <div style={{ width: `${((index + 1) / deck.length) * 100}%` }} />
      </div>

      <QuestionCard question={q} selected={selected} revealed={revealed} onSelect={choose} />

      <div className="nav-row">
        <button type="button" className="ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          ← Previous
        </button>
        {index < deck.length - 1 ? (
          <button type="button" className="primary" onClick={() => setIndex(index + 1)}>
            Next →
          </button>
        ) : (
          <button type="button" className="primary" onClick={finish}>
            Finish
          </button>
        )}
      </div>
      <div className="nav-row">
        <button type="button" className="link" onClick={finish}>
          End quiz and see score
        </button>
      </div>
    </section>
  );
}
