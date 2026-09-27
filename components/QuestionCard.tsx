import type { Question } from "@/lib/questions";

type Props = {
  question: Question;
  selected?: string;
  revealed: boolean;
  onSelect?: (key: string) => void;
};

export default function QuestionCard({ question, selected, revealed, onSelect }: Props) {
  return (
    <article className="card">
      <div className="card-meta">
        <span>Q{question.id}</span>
        <span className="topic">{question.topic}</span>
        {revealed && question.disputed && (
          <span className="badge" title="Different answer keys disagree on this one">
            Disputed answer
          </span>
        )}
      </div>
      <p className="stem">{question.question}</p>

      <ul className="options">
        {question.options.map((o) => {
          let state = "";
          if (revealed) {
            if (o.key === question.answer) state = "correct";
            else if (o.key === selected) state = "wrong";
          } else if (o.key === selected) {
            state = "selected";
          }
          return (
            <li key={o.key}>
              <button
                type="button"
                className={`option ${state}`}
                disabled={!onSelect || revealed}
                onClick={() => onSelect?.(o.key)}
              >
                <span className="key">{o.key}</span>
                <span className="text">{o.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {revealed && (
        <div className={`explain ${selected === question.answer ? "ok" : "bad"}`}>
          <strong>
            {selected === undefined
              ? `Answer: ${question.answer}`
              : selected === question.answer
                ? "Correct"
                : `Incorrect. The answer is ${question.answer}`}
          </strong>
          <p>{question.explanation}</p>
        </div>
      )}
    </article>
  );
}
