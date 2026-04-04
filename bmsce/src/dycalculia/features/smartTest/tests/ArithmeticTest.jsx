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

  const wrongAnswers = new Set();
  while (wrongAnswers.size < 3) {
    const offset = Math.floor(Math.random() * 20) - 10;
    const wrong = correctAnswer + offset;
    if (wrong !== correctAnswer && wrong > 0) {
      wrongAnswers.add(wrong);
    }
  }

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
    <div className="at-root">
      <header className="at-header">
        <p className="at-instruction" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
          Solve the <strong>math problem</strong>
        </p>
        <div className="at-meta">
          <span className="at-badge">Question {questionIndex + 1} / {TOTAL_QUESTIONS}</span>
          <span className="at-badge">Score: {score}</span>
        </div>
        <div className="at-progress-track">
          <div className="at-progress-fill" style={{ width: `${((questionIndex + 1) / TOTAL_QUESTIONS) * 100}%` }} />
        </div>
      </header>

      <div className="at-question-box">
        <div className="at-equation">
          <span>{question.num1}</span>
          <span className="at-operator">{question.operation}</span>
          <span>{question.num2}</span>
          <span>=</span>
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

      <div className="at-feedback" style={{ minHeight: '60px', marginTop: '20px' }}>
        {answered && (
          <span style={{ 
            color: selectedAnswer === question.correctAnswer ? "#10b981" : "#ef4444",
            fontWeight: '800',
            fontSize: '1.2rem',
            animation: 'dy-fade-in-up 0.3s ease'
          }}>
            {selectedAnswer === question.correctAnswer ? "✓ Brilliant!" : `✗ Answer: ${question.correctAnswer}`}
          </span>
        )}
      </div>
    </div>
  );
}
