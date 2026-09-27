"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Question } from "@/lib/questions";
import {
  type Attempt,
  type Mode,
  type SavedQuiz,
  addAttempt,
  clearHistory,
  loadHistory,
  loadMissed,
  loadQuiz,
  saveMissed,
  saveQuiz,
} from "@/lib/storage";
import QuestionCard from "./QuestionCard";

type Phase = "setup" | "running" | "results";

// Real exam: 125 questions in 4 hours.
const SECONDS_PER_QUESTION = (4 * 60 * 60) / 125;
const ALL_TOPICS = "All topics";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

type Props = { questions: Question[]; topics: string[] };

export default function Quiz({ questions, topics }: Props) {
  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);

  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<Mode>("practice");
  const [count, setCount] = useState(25);
  const [topic, setTopic] = useState(ALL_TOPICS);
  const [randomize, setRandomize] = useState(true);
  const [missedOnly, setMissedOnly] = useState(false);
  const [timed, setTimed] = useState(true);

  const [missed, setMissed] = useState<number[]>([]);
  const [history, setHistory] = useState<Attempt[]>([]);
  const [saved, setSaved] = useState<SavedQuiz | null>(null);

  const [deck, setDeck] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [showGrid, setShowGrid] = useState(false);
  const [lastTopic, setLastTopic] = useState(ALL_TOPICS);

  // Browser storage is only readable after hydration.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMissed(loadMissed());
    setHistory(loadHistory());
    setSaved(loadQuiz());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Save progress so a refresh or closing the app doesn't lose the quiz.
  useEffect(() => {
    if (phase !== "running") return;
    saveQuiz({ mode, topic: lastTopic, ids: deck.map((q) => q.id), index, answers, flagged, endsAt });
  }, [phase, mode, lastTopic, deck, index, answers, flagged, endsAt]);

  const pool = useMemo(() => {
    let list = questions;
    if (topic !== ALL_TOPICS) list = list.filter((q) => q.topic === topic);
    if (missedOnly) list = list.filter((q) => missed.includes(q.id));
    return list;
  }, [questions, topic, missedOnly, missed]);

  const finish = useCallback(() => {
    const nextMissed = new Set(missed);
    let correct = 0;
    for (const q of deck) {
      const a = answers[q.id];
      if (a === q.answer) {
        correct++;
        nextMissed.delete(q.id);
      } else if (a) {
        nextMissed.add(q.id);
      }
    }
    const list = [...nextMissed].sort((a, b) => a - b);
    setMissed(list);
    saveMissed(list);
    setHistory(addAttempt({ date: Date.now(), mode, topic: lastTopic, total: deck.length, correct }));
    saveQuiz(null);
    setSaved(null);
    setShowGrid(false);
    setPhase("results");
  }, [missed, deck, answers, mode, lastTopic]);

  // Exam countdown; submits automatically when time runs out.
  useEffect(() => {
    if (phase !== "running" || endsAt === null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [phase, endsAt]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- time's up: submit the exam
    if (phase === "running" && endsAt !== null && now >= endsAt) finish();
  }, [phase, endsAt, now, finish]);

  function begin(list: Question[], m: Mode, ends: number | null, state?: SavedQuiz) {
    setMode(m);
    setDeck(list);
    setIndex(state?.index ?? 0);
    setAnswers(state?.answers ?? {});
    setFlagged(state?.flagged ?? []);
    setEndsAt(ends);
    setNow(Date.now());
    setShowGrid(false);
    setPhase("running");
  }

  function start() {
    const ordered = randomize ? shuffle(pool) : pool;
    const list = ordered.slice(0, Math.min(count, ordered.length));
    const ends = mode === "exam" && timed ? Date.now() + list.length * SECONDS_PER_QUESTION * 1000 : null;
    setLastTopic(topic);
    begin(list, mode, ends);
  }

  function resume() {
    if (!saved) return;
    const list = saved.ids.map((id) => byId.get(id)).filter((q): q is Question => !!q);
    setLastTopic(saved.topic ?? ALL_TOPICS);
    begin(list, saved.mode, saved.endsAt, saved);
  }

  const choose = useCallback(
    (key: string) => {
      const q = deck[index];
      if (!q) return;
      if (mode === "practice" && answers[q.id]) return;
      setAnswers((prev) => ({ ...prev, [q.id]: key }));
    },
    [deck, index, mode, answers],
  );

  const toggleFlag = useCallback(() => {
    const id = deck[index]?.id;
    if (id === undefined) return;
    setFlagged((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, [deck, index]);

  // Keyboard: A-D or 1-4 to answer, ←/→ to move, F to flag.
  useEffect(() => {
    if (phase !== "running") return;
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest("input, select, textarea")) return;
      const q = deck[index];
      const k = e.key.toLowerCase();
      const byLetter = q?.options.find((o) => o.key.toLowerCase() === k);
      const byNumber = /^[1-9]$/.test(k) ? q?.options[Number(k) - 1] : undefined;
      if (byLetter || byNumber) {
        choose((byLetter ?? byNumber)!.key);
      } else if (e.key === "ArrowRight") {
        setIndex((i) => Math.min(i + 1, deck.length - 1));
      } else if (e.key === "ArrowLeft") {
        setIndex((i) => Math.max(i - 1, 0));
      } else if (k === "f") {
        toggleFlag();
      } else {
        return;
      }
      e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, deck, index, choose, toggleFlag]);

  if (phase === "setup") {
    return (
      <section>
        {saved && saved.ids.length > 0 && (
          <div className="panel resume">
            <div>
              <strong>Quiz in progress</strong>
              <p className="muted">
                {saved.mode === "exam" ? "Exam" : "Practice"} · {Object.keys(saved.answers).length} of{" "}
                {saved.ids.length} answered
              </p>
            </div>
            <div className="actions tight">
              <button className="primary" type="button" onClick={resume}>
                Resume
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => {
                  saveQuiz(null);
                  setSaved(null);
                }}
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <div className="panel">
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
            <label className="label" htmlFor="topic">
              Topic
            </label>
            <select id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value={ALL_TOPICS}>All topics ({questions.length})</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t} ({questions.filter((q) => q.topic === t).length})
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="count">
              Number of questions
            </label>
            <select id="count" value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[10, 25, 50, 125].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
              <option value={Number.MAX_SAFE_INTEGER}>All available</option>
            </select>
            <span className="hint">
              {Math.min(count, pool.length)} of {pool.length} available will be used. The real exam has 125
              questions in 4 hours.
            </span>
          </div>

          <label className="check">
            <input type="checkbox" checked={randomize} onChange={(e) => setRandomize(e.target.checked)} />
            Shuffle questions
          </label>

          {mode === "exam" && (
            <label className="check">
              <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
              Timer (exam pace: about 1 min 55 s per question)
            </label>
          )}

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
                Clear wrong-answer list
              </button>
            )}
          </div>
          <p className="hint shortcuts">
            Keyboard: A–D or 1–4 to answer · ← → to move · F to flag
          </p>
        </div>

        {history.length > 0 && (
          <div className="panel history">
            <div className="history-head">
              <h2>Recent scores</h2>
              <button
                type="button"
                className="link"
                onClick={() => {
                  clearHistory();
                  setHistory([]);
                }}
              >
                Clear
              </button>
            </div>
            <ul>
              {history.slice(0, 8).map((a) => {
                const pct = a.total ? Math.round((a.correct / a.total) * 100) : 0;
                return (
                  <li key={a.date}>
                    <span className={`score ${pct >= 70 ? "pass" : "fail"}`}>{pct}%</span>
                    <span>
                      {a.correct}/{a.total} · {a.mode === "exam" ? "Exam" : "Practice"}
                      {a.topic !== ALL_TOPICS && ` · ${a.topic}`}
                    </span>
                    <span className="muted date">{new Date(a.date).toLocaleDateString()}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    );
  }

  if (phase === "results") {
    const correct = deck.filter((q) => answers[q.id] === q.answer).length;
    const unanswered = deck.filter((q) => !answers[q.id]).length;
    const pct = deck.length ? Math.round((correct / deck.length) * 100) : 0;
    const wrong = deck.filter((q) => answers[q.id] !== q.answer);

    return (
      <section>
        <div className="panel results">
          <h1>{pct}%</h1>
          <p>
            {correct} of {deck.length} correct
            {unanswered > 0 && ` (${unanswered} unanswered, counted as wrong)`}.{" "}
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
  const answeredCount = deck.filter((d) => answers[d.id]).length;
  const isFlagged = flagged.includes(q.id);
  const remaining = endsAt === null ? null : endsAt - now;

  return (
    <section>
      <div className="progress-row">
        <span>
          Question {index + 1} / {deck.length}
        </span>
        <span className="muted">
          {answeredCount} answered
          {remaining !== null && (
            <span className={`timer ${remaining < 5 * 60 * 1000 ? "low" : ""}`}> · ⏱ {formatTime(remaining)}</span>
          )}
        </span>
      </div>
      <div className="progress">
        <div style={{ width: `${((index + 1) / deck.length) * 100}%` }} />
      </div>

      <div className="toolbar-row">
        <button type="button" className={`chip ${isFlagged ? "on" : ""}`} onClick={toggleFlag}>
          {isFlagged ? "★ Flagged" : "☆ Flag for review"}
        </button>
        <button type="button" className="chip" onClick={() => setShowGrid((s) => !s)}>
          {showGrid ? "Hide questions" : "All questions"}
        </button>
      </div>

      {showGrid && (
        <div className="grid" role="navigation" aria-label="Jump to question">
          {deck.map((d, i) => {
            const a = answers[d.id];
            let state = a ? "answered" : "";
            if (mode === "practice" && a) state = a === d.answer ? "right" : "wrong";
            return (
              <button
                key={d.id}
                type="button"
                className={`cell ${state} ${i === index ? "current" : ""} ${flagged.includes(d.id) ? "flag" : ""}`}
                onClick={() => {
                  setIndex(i);
                  setShowGrid(false);
                }}
                aria-label={`Question ${i + 1}${a ? ", answered" : ""}${flagged.includes(d.id) ? ", flagged" : ""}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      )}

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
        <button
          type="button"
          className="link"
          onClick={() => {
            const left = deck.length - answeredCount;
            if (left === 0 || window.confirm(`${left} question(s) unanswered. End the quiz and see your score?`)) {
              finish();
            }
          }}
        >
          End quiz and see score
        </button>
      </div>
    </section>
  );
}
