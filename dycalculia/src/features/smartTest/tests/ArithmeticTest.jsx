import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const TOTAL_QUESTIONS = 8;
const NEXT_DELAY_MS = 1000;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function generateQuestion(difficulty) {
  const operations = ['+', '-', '×', '÷'];
  const op = operations[Math.floor(Math.random() * operations.length)];

  let num1, num2, correctAnswer;

  switch(op) {
    case '+':
      num1 = Math.floor(Math.random() * (10 + difficulty * 15)) + 1;
      num2 = Math.floor(Math.random() * (10 + difficulty * 15)) + 1;
      correctAnswer = num1 + num2;
      break;
    case '-':
      num2 = Math.floor(Math.random() * (10 + difficulty * 10)) + 1;
      num1 = num2 + Math.floor(Math.random() * (10 + difficulty * 10)) + 1;
      correctAnswer = num1 - num2;
      break;
    case '×':
      num1 = Math.floor(Math.random() * (5 + difficulty * 3)) + 2;
      num2 = Math.floor(Math.random() * (5 + difficulty * 3)) + 2;
      correctAnswer = num1 * num2;
      break;
    case '÷':
      num2 = Math.floor(Math.random() * 8) + 2;
      correctAnswer = Math.floor(Math.random() * 10) + 1;
      num1 = num2 * correctAnswer;
      break;
    default:
      num1 = 5;
      num2 = 3;
      correctAnswer = 8;
  }

  // Generate 3 wrong answers
  const wrongAnswers = new Set();
  while (wrongAnswers.size < 3) {
    const offset = Math.floor(Math.random() * 20) - 10;
    const wrong = correctAnswer + offset;
    if (wrong !== correctAnswer && wrong > 0) {
      wrongAnswers.add(wrong);
    }
  }

  // Shuffle options
  const options = [correctAnswer, ...Array.from(wrongAnswers)];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    num1,
    num2,
    operation: op,
    correctAnswer,
    options,
  };
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT: ArithmeticTest
───────────────────────────────────────────── */
export default function ArithmeticTest({ onFinish }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState(() => generateQuestion(0));
  const [score, setScore] = useState(0);
  const [responseTimes, setResponseTimes] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);

  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [question]);

  const loadNextQuestion = useCallback((currentScore, currentTimes) => {
    const nextIndex = questionIndex + 1;

    if (nextIndex >= TOTAL_QUESTIONS) {
      const avg = currentTimes.length > 0
        ? currentTimes.reduce((a, b) => a + b, 0) / currentTimes.length
        : 0;
      if (onFinish) {
        onFinish({
          accuracy: currentScore / TOTAL_QUESTIONS,
          avgTime: parseFloat(avg.toFixed(2)),
        });
      }
    } else {
      const difficulty = Math.floor(nextIndex / 3);
      setQuestionIndex(nextIndex);
      setQuestion(generateQuestion(difficulty));
      setSelectedAnswer(null);
      setAnswered(false);
    }
  }, [questionIndex, onFinish]);

  const handleAnswer = useCallback((answer) => {
    if (answered) return;

    const elapsed = parseFloat(((Date.now() - startTimeRef.current) / 1000).toFixed(2));
    const isCorrect = answer === question.correctAnswer;

    const newTimes = [...responseTimes, elapsed];
    const newScore = isCorrect ? score + 1 : score;

    setResponseTimes(newTimes);
    setScore(newScore);
    setSelectedAnswer(answer);
    setAnswered(true);

    setTimeout(() => loadNextQuestion(newScore, newTimes), NEXT_DELAY_MS);
  }, [answered, question, score, responseTimes, loadNextQuestion]);

  return (
    <>
      <ArithmeticTestStyles />
      <div className="at-root">
        <header className="at-header">
          <p className="at-instruction">
            Solve the <strong>math problem</strong>
          </p>
          <div className="at-meta">
            <span className="at-badge">Q {questionIndex + 1} / {TOTAL_QUESTIONS}</span>
            <span className="at-badge">Score: {score}</span>
          </div>
          <div className="at-progress-track" role="progressbar" aria-valuenow={questionIndex} aria-valuemax={TOTAL_QUESTIONS}>
            <div className="at-progress-fill" style={{ width: `${(questionIndex / TOTAL_QUESTIONS) * 100}%` }} />
          </div>
        </header>

        <div className="at-question-box">
          <div className="at-equation">
            <span className="at-number">{question.num1}</span>
            <span className="at-operator">{question.operation}</span>
            <span className="at-number">{question.num2}</span>
            <span className="at-equals">=</span>
            <span className="at-qmark">?</span>
          </div>
        </div>

        <div className="at-options-grid">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.correctAnswer;
            const showCorrect = answered && isCorrect;
            const showWrong = answered && isSelected && !isCorrect;

            let btnClass = "at-option-btn";
            if (showCorrect) btnClass += " at-correct";
            if (showWrong) btnClass += " at-wrong";

            return (
              <button
                key={idx}
                className={btnClass}
                onClick={() => handleAnswer(option)}
                disabled={answered}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="at-feedback" aria-live="polite">
          {answered && (
            <span className={selectedAnswer === question.correctAnswer ? "at-fb-correct" : "at-fb-wrong"}>
              {selectedAnswer === question.correctAnswer ? "✓ Correct!" : `✗ Wrong! Answer: ${question.correctAnswer}`}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   SCOPED STYLES
───────────────────────────────────────────── */
function ArithmeticTestStyles() {
  return (
    <style>{`
      @keyframes atFadeSlide {
        from { opacity:0; transform:translateY(16px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes atPopIn {
        from { opacity:0; transform:scale(0.8); }
        to   { opacity:1; transform:scale(1); }
      }
      @keyframes atPulseGreen {
        0%   { box-shadow:0 0 0 0 rgba(34,197,94,0); }
        40%  { box-shadow:0 0 0 12px rgba(34,197,94,0.4); }
        100% { box-shadow:0 0 0 0 rgba(34,197,94,0); }
      }
      @keyframes atShakeRed {
        0%, 100% { transform:translateX(0); }
        25%      { transform:translateX(-8px); }
        75%      { transform:translateX(8px); }
      }

      .at-root {
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        gap:32px; padding:36px 16px 52px; min-height:100vh;
        animation:atFadeSlide 0.4s ease both;
      }

      .at-header {
        width:100%; max-width:580px;
        display:flex; flex-direction:column; align-items:center; gap:10px;
      }

      .at-instruction {
        font-size:1.1rem; color:var(--text-h); margin:0;
      }

      .at-meta {
        display:flex; gap:10px;
      }

      .at-badge {
        font-size:0.8rem; font-weight:600; padding:4px 14px;
        border-radius:99px; background:var(--accent-bg); color:var(--accent);
        border:1px solid var(--accent-border); letter-spacing:0.3px;
      }

      .at-progress-track {
        width:100%; max-width:440px; height:5px;
        background:var(--border); border-radius:99px; overflow:hidden;
      }

      .at-progress-fill {
        height:100%; background:var(--accent); border-radius:99px;
        transition:width 0.45s ease;
      }

      .at-question-box {
        background:rgba(30,41,59,0.7); backdrop-filter:blur(12px);
        border:1px solid var(--border); border-radius:24px;
        padding:40px 60px; box-shadow:0 10px 40px rgba(0,0,0,0.2);
        animation:atPopIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
      }

      .at-equation {
        display:flex; align-items:center; gap:20px;
        font-size:3rem; font-weight:700; color:var(--text-h);
      }

      .at-number {
        color:var(--accent); min-width:80px; text-align:center;
      }

      .at-operator {
        color:var(--text); font-size:2.5rem;
      }

      .at-equals {
        color:var(--text); font-size:2.5rem;
      }

      .at-qmark {
        color:var(--accent); font-size:3.5rem;
      }

      .at-options-grid {
        display:grid; grid-template-columns:repeat(2, 1fr);
        gap:16px; width:100%; max-width:480px;
      }

      .at-option-btn {
        font-size:1.8rem; font-weight:700; padding:24px;
        background:var(--bg); border:2px solid var(--border);
        border-radius:16px; color:var(--text-h);
        cursor:pointer; transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        box-shadow:0 2px 10px rgba(0,0,0,0.06);
      }

      .at-option-btn:not(:disabled):hover {
        transform:scale(1.08); border-color:var(--accent);
        box-shadow:0 8px 24px rgba(0,0,0,0.12);
      }

      .at-option-btn:not(:disabled):active {
        transform:scale(0.95);
      }

      .at-option-btn:disabled {
        cursor:default;
      }

      .at-option-btn.at-correct {
        background:rgba(34,197,94,0.15); border-color:#22c55e;
        color:#16a34a; animation:atPulseGreen 0.6s ease forwards;
      }

      .at-option-btn.at-wrong {
        background:rgba(239,68,68,0.15); border-color:#ef4444;
        color:#dc2626; animation:atShakeRed 0.4s ease forwards;
      }

      .at-feedback {
        min-height:40px; display:flex;
        align-items:center; justify-content:center;
      }

      .at-fb-correct, .at-fb-wrong {
        font-size:1rem; font-weight:700;
        padding:8px 24px; border-radius:99px;
        animation:atPopIn 0.25s ease both;
      }

      .at-fb-correct {
        color:#16a34a; background:rgba(34,197,94,0.15);
      }

      .at-fb-wrong {
        color:#dc2626; background:rgba(239,68,68,0.15);
      }

      @media (max-width: 640px) {
        .at-equation {
          font-size:2rem; gap:12px;
        }
        .at-number {
          min-width:60px;
        }
        .at-operator, .at-equals {
          font-size:1.8rem;
        }
        .at-qmark {
          font-size:2.5rem;
        }
        .at-question-box {
          padding:30px 40px;
        }
        .at-options-grid {
          max-width:100%;
        }
        .at-option-btn {
          font-size:1.5rem; padding:20px;
        }
      }
    `}</style>
  );
}
