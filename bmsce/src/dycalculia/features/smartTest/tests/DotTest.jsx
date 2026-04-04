import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const TOTAL_QUESTIONS = 5;
const MIN_DOTS = 5;
const MAX_DOTS = 20;
const MIN_DIFF = 3;
const NEXT_DELAY_MS = 900;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function generateDotPair() {
  let left, right;
  do {
    left = Math.floor(Math.random() * (MAX_DOTS - MIN_DOTS + 1)) + MIN_DOTS;
    right = Math.floor(Math.random() * (MAX_DOTS - MIN_DOTS + 1)) + MIN_DOTS;
  } while (Math.abs(left - right) < MIN_DIFF);
  return { left, right };
}

function generateDotPositions(count, boxSize = 240, dotRadius = 10) {
  const positions = [];
  const maxAttempts = 300;
  const padding = dotRadius + 6;

  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = padding + Math.random() * (boxSize - padding * 2);
      const y = padding + Math.random() * (boxSize - padding * 2);
      const overlap = positions.some((p) => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx * dx + dy * dy) < dotRadius * 2 + 4;
      });
      if (!overlap) {
        positions.push({ x, y, id: i });
        placed = true;
        break;
      }
    }
    if (!placed) {
      positions.push({
        x: padding + Math.random() * (boxSize - padding * 2),
        y: padding + Math.random() * (boxSize - padding * 2),
        id: i,
      });
    }
  }
  return positions;
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
function Dot({ x, y, color, delay }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={10}
      fill={color}
      style={{
        animation: `dotPop 0.35s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
      }}
    />
  );
}

function DotBox({ dots, side, onClick, state, disabled }) {
  const flashClass = state === "correct" ? "dt-flash-green" : state === "wrong" ? "dt-flash-red" : "";
  const dotColor = state === "correct" ? "#10b981" : state === "wrong" ? "#ef4444" : "#3b82f6";
  
  return (
    <button
      className={`dt-dot-box ${flashClass}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`${side} box`}
      style={{ 
        borderColor: state === "correct" ? "#10b981" : state === "wrong" ? "#ef4444" : "rgba(255,255,255,0.1)",
        backgroundColor: state === "correct" ? "rgba(16,185,129,0.1)" : state === "wrong" ? "rgba(239,68,68,0.1)" : "rgba(15,23,42,0.6)",
        cursor: disabled ? 'default' : 'pointer'
      }}
    >
      <svg width={240} height={240} viewBox="0 0 240 240" aria-hidden="true" style={{ display: "block" }}>
        {dots.map((d, i) => (
          <Dot
            key={`${side}-${d.id}-${dots.length}`}
            x={d.x}
            y={d.y}
            color={dotColor}
            delay={i * 0.025}
          />
        ))}
      </svg>
    </button>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT: DotTest
───────────────────────────────────────────── */
export default function DotTest({ onFinish }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [dotPair, setDotPair] = useState(() => generateDotPair());
  const [leftDots, setLeftDots] = useState([]);
  const [rightDots, setRightDots] = useState([]);
  const [score, setScore] = useState(0);
  const [responseTimes, setResponseTimes] = useState([]);
  const [boxStates, setBoxStates] = useState({ left: "idle", right: "idle" });
  const [answered, setAnswered] = useState(false);

  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    setLeftDots(generateDotPositions(dotPair.left));
    setRightDots(generateDotPositions(dotPair.right));
    startTimeRef.current = Date.now();
  }, [dotPair]);

  const loadNextQuestion = useCallback(
    (currentScore, currentTimes) => {
      const nextIndex = questionIndex + 1;
      if (nextIndex >= TOTAL_QUESTIONS) {
        const avg = currentTimes.length > 0 ? currentTimes.reduce((a, b) => a + b, 0) / currentTimes.length : 0;
        if (onFinish) {
          onFinish({ accuracy: currentScore / TOTAL_QUESTIONS, avgTime: parseFloat(avg.toFixed(2)) });
        }
      } else {
        setQuestionIndex(nextIndex);
        setDotPair(generateDotPair());
        setBoxStates({ left: "idle", right: "idle" });
        setAnswered(false);
      }
    },
    [questionIndex, onFinish]
  );

  const handleAnswer = useCallback(
    (chosen) => {
      if (answered) return;
      const elapsed = parseFloat(((Date.now() - startTimeRef.current) / 1000).toFixed(2));
      const correct = dotPair.left > dotPair.right ? "left" : "right";
      const isCorrect = chosen === correct;
      const newTimes = [...responseTimes, elapsed];
      const newScore = isCorrect ? score + 1 : score;

      setResponseTimes(newTimes);
      setScore(newScore);
      setBoxStates({
        [chosen]: isCorrect ? "correct" : "wrong",
        [chosen === "left" ? "right" : "left"]: "unselected",
      });
      setAnswered(true);
      setTimeout(() => loadNextQuestion(newScore, newTimes), NEXT_DELAY_MS);
    },
    [answered, dotPair, score, responseTimes, loadNextQuestion]
  );

  return (
    <div className="dt-root">
      <header className="dt-header">
        <p className="dt-instruction">
          Which box has <strong>more dots</strong>?
        </p>
        <div className="dt-meta">
          <span className="dt-badge">Question {questionIndex + 1} / {TOTAL_QUESTIONS}</span>
          <span className="dt-badge">Accuracy: {Math.round((score / (questionIndex + 1)) * 100)}%</span>
        </div>
        <div className="dt-progress-track">
          <div className="dt-progress-fill" style={{ width: `${((questionIndex + 1) / TOTAL_QUESTIONS) * 100}%` }} />
        </div>
      </header>

      <div className="dt-boxes-row">
        <DotBox dots={leftDots} side="Left" onClick={() => handleAnswer("left")} state={boxStates.left} disabled={answered} />
        <span style={{ fontSize: '0.8rem', fontWeight: '800', opacity: 0.3, letterSpacing: '2px' }}>VS</span>
        <DotBox dots={rightDots} side="Right" onClick={() => handleAnswer("right")} state={boxStates.right} disabled={answered} />
      </div>

      <div style={{ minHeight: '40px', marginTop: '20px' }}>
        {answered && (
          <span style={{ 
            color: boxStates.left === "correct" || boxStates.right === "correct" ? "#10b981" : "#ef4444",
            fontWeight: '700',
            fontSize: '1.1rem',
            animation: 'dy-fade-in-up 0.3s ease'
          }}>
            {boxStates.left === "correct" || boxStates.right === "correct" ? "✓ Excellent!" : "✗ Not quite!"}
          </span>
        )}
      </div>
    </div>
  );
}
