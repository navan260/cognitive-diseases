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
   SUB-COMPONENT: Dot (SVG circle)
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

/* ─────────────────────────────────────────────
   SUB-COMPONENT: DotBox
───────────────────────────────────────────── */
function DotBox({ dots, side, onClick, state, disabled }) {
  const borderColor =
    state === "correct" ? "#22c55e" : state === "wrong" ? "#ef4444" : "var(--border)";
  const bgColor =
    state === "correct"
      ? "rgba(34,197,94,0.12)"
      : state === "wrong"
      ? "rgba(239,68,68,0.12)"
      : "var(--bg)";
  const dotColor =
    state === "correct" ? "#16a34a" : state === "wrong" ? "#dc2626" : "var(--accent)";
  const flashClass =
    state === "correct" ? "dt-flash-green" : state === "wrong" ? "dt-flash-red" : "";

  return (
    <button
      className={`dt-dot-box ${flashClass}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`${side} box`}
      style={{ borderColor, backgroundColor: bgColor, cursor: disabled ? "default" : "pointer" }}
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
   Props:
     onFinish({ accuracy, avgTime }) — called when all questions are answered
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
        const avg =
          currentTimes.length > 0
            ? currentTimes.reduce((a, b) => a + b, 0) / currentTimes.length
            : 0;
        if (onFinish) {
          onFinish({
            accuracy: currentScore / TOTAL_QUESTIONS,
            avgTime: parseFloat(avg.toFixed(2)),
          });
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
    <>
      <DotTestStyles />
      <div className="dt-root">
        <header className="dt-header" style={{ zIndex: 1 }}>
          <p className="dt-instruction">
            Which box has <strong>more dots</strong>?
          </p>
          <div className="dt-meta">
            <span className="dt-badge">Q {questionIndex + 1} / {TOTAL_QUESTIONS}</span>
            <span className="dt-badge">Score: {score}</span>
          </div>
          <div className="dt-progress-track" role="progressbar" aria-valuenow={questionIndex} aria-valuemax={TOTAL_QUESTIONS}>
            <div className="dt-progress-fill" style={{ width: `${(questionIndex / TOTAL_QUESTIONS) * 100}%` }} />
          </div>
        </header>

        <div className="dt-boxes-row">
          <DotBox dots={leftDots} side="Left" onClick={() => handleAnswer("left")} state={boxStates.left} disabled={answered} />
          <span className="dt-vs" aria-hidden="true">VS</span>
          <DotBox dots={rightDots} side="Right" onClick={() => handleAnswer("right")} state={boxStates.right} disabled={answered} />
        </div>

        <div className="dt-feedback" aria-live="polite">
          {answered && (
            <span className={boxStates.left === "correct" || boxStates.right === "correct" ? "dt-fb-correct" : "dt-fb-wrong"}>
              {boxStates.left === "correct" || boxStates.right === "correct" ? "✓ Correct!" : "✗ Wrong!"}
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
function DotTestStyles() {
  return (
    <style>{`
      @keyframes dotPop {
        0%   { opacity:0; transform:scale(0); }
        100% { opacity:1; transform:scale(1); }
      }
      @keyframes dtFlashGreen {
        0%   { box-shadow:0 0 0 0 rgba(34,197,94,0); }
        40%  { box-shadow:0 0 0 16px rgba(34,197,94,0.45); }
        100% { box-shadow:0 0 0 0 rgba(34,197,94,0); }
      }
      @keyframes dtFlashRed {
        0%   { box-shadow:0 0 0 0 rgba(239,68,68,0); }
        40%  { box-shadow:0 0 0 16px rgba(239,68,68,0.45); }
        100% { box-shadow:0 0 0 0 rgba(239,68,68,0); }
      }
      @keyframes dtFadeSlide {
        from { opacity:0; transform:translateY(16px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes dtPopIn {
        from { opacity:0; transform:scale(0.8); }
        to   { opacity:1; transform:scale(1); }
      }
      .dt-root {
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        gap:28px; padding:36px 16px 52px; min-height: 100vh;
        animation:dtFadeSlide 0.4s ease both;
      }
      .dt-header {
        width:100%; max-width:580px;
        display:flex; flex-direction:column; align-items:center; gap:10px;
      }
      .dt-instruction { font-size:1.1rem; color:var(--text-h); margin:0; }
      .dt-meta { display:flex; gap:10px; }
      .dt-badge {
        font-size:0.8rem; font-weight:600; padding:4px 14px;
        border-radius:99px; background:var(--accent-bg); color:var(--accent);
        border:1px solid var(--accent-border); letter-spacing:0.3px;
      }
      .dt-progress-track {
        width:100%; max-width:440px; height:5px;
        background:var(--border); border-radius:99px; overflow:hidden;
      }
      .dt-progress-fill {
        height:100%; background:var(--accent); border-radius:99px;
        transition:width 0.45s ease;
      }
      .dt-boxes-row {
        display:flex; align-items:center; gap:24px;
        flex-wrap:wrap; justify-content:center;
      }
      .dt-vs {
        font-size:0.8rem; font-weight:700; letter-spacing:1.5px;
        color:var(--text); opacity:0.45; user-select:none;
      }
      .dt-dot-box {
        width:256px; height:256px; border-radius:20px;
        border:2px solid var(--border); background:var(--bg);
        padding:8px; box-sizing:border-box;
        transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1),
          border-color 0.22s ease, background-color 0.22s ease, box-shadow 0.22s ease;
        box-shadow:0 2px 10px rgba(0,0,0,0.06);
      }
      .dt-dot-box:not(:disabled):hover {
        transform:scale(1.05);
        box-shadow:0 10px 32px rgba(0,0,0,0.14);
      }
      .dt-dot-box:not(:disabled):active { transform:scale(0.97); }
      .dt-dot-box.dt-flash-green { animation:dtFlashGreen 0.6s ease forwards; }
      .dt-dot-box.dt-flash-red   { animation:dtFlashRed   0.6s ease forwards; }
      .dt-feedback {
        min-height:36px; display:flex;
        align-items:center; justify-content:center;
      }
      .dt-fb-correct, .dt-fb-wrong {
        font-size:0.95rem; font-weight:700;
        padding:6px 20px; border-radius:99px;
        animation:dtPopIn 0.25s ease both;
      }
      .dt-fb-correct { color:#16a34a; background:rgba(34,197,94,0.13); }
      .dt-fb-wrong   { color:#dc2626; background:rgba(239,68,68,0.13); }
    `}</style>
  );
}
