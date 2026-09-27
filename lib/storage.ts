// Browser-only persistence. Every access is wrapped because storage can be
// unavailable (private mode, blocked site data); the app still works without it.

export type Mode = "practice" | "exam";

export type SavedQuiz = {
  mode: Mode;
  topic: string;
  ids: number[];
  index: number;
  answers: Record<number, string>;
  flagged: number[];
  /** Epoch ms when an exam's timer runs out; null when untimed. */
  endsAt: number | null;
};

export type Attempt = {
  date: number;
  mode: Mode;
  topic: string;
  total: number;
  correct: number;
};

const KEYS = {
  missed: "ceh-missed",
  quiz: "ceh-quiz-in-progress",
  history: "ceh-history",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore — progress just isn't remembered
  }
}

export const loadMissed = () => read<number[]>(KEYS.missed, []);
export const saveMissed = (ids: number[]) => write(KEYS.missed, ids);

export const loadQuiz = () => read<SavedQuiz | null>(KEYS.quiz, null);
export const saveQuiz = (quiz: SavedQuiz | null) => write(KEYS.quiz, quiz);

export const loadHistory = () => read<Attempt[]>(KEYS.history, []);
export function addAttempt(attempt: Attempt) {
  const history = [attempt, ...loadHistory()].slice(0, 20);
  write(KEYS.history, history);
  return history;
}
export const clearHistory = () => write(KEYS.history, null);
