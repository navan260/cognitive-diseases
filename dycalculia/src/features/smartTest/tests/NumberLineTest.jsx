import { useState, useCallback } from "react";

const TOTAL_QUESTIONS = 5;
const NEXT_DELAY_MS = 1500;

// Generate random number between 5 and 95 so it's not too close to the edges
function getRandomNumber() {
    return Math.floor(Math.random() * 91) + 5;
}

export default function NumberLineTest({ onFinish }) {
    const [questionIndex, setQuestionIndex] = useState(0);
    const [target, setTarget] = useState(() => getRandomNumber());
    const [errors, setErrors] = useState([]);
    
    // Interaction state
    const [answered, setAnswered] = useState(false);
    const [userEstimate, setUserEstimate] = useState(null);
    const [actualError, setActualError] = useState(null);

    const handleNextQuestion = useCallback((updatedErrors) => {
        if (questionIndex + 1 >= TOTAL_QUESTIONS) {
            const avgError =
                updatedErrors.length > 0
                    ? updatedErrors.reduce((a, b) => a + b, 0) / updatedErrors.length
                    : 0;

            if (onFinish) {
                onFinish({
                    avgError: parseFloat(avgError.toFixed(2)),
                });
            }
        } else {
            setQuestionIndex(prev => prev + 1);
            setTarget(getRandomNumber());
            setAnswered(false);
            setUserEstimate(null);
            setActualError(null);
        }
    }, [questionIndex, onFinish]);

    const handleClick = (e) => {
        if (answered) return;

        const rect = e.currentTarget.getBoundingClientRect();
        // Constrain click to 0 - width
        const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = clickX / rect.width;

        const estimated = Math.round(percentage * 100);
        const err = Math.abs(estimated - target);

        setUserEstimate(estimated);
        setActualError(err);
        setAnswered(true);

        const updatedErrors = [...errors, err];
        setErrors(updatedErrors);

        setTimeout(() => {
            handleNextQuestion(updatedErrors);
        }, NEXT_DELAY_MS);
    };

    // Generate ticks for ALL units 0..100
    const allTicks = Array.from({ length: 101 }, (_, i) => i);

    return (
        <>
            <NumberLineStyles />
            <div className="nl-root">
                <header className="nl-header">
                    <p className="nl-instruction">
                        Where does <strong>{target}</strong> belong on the line?
                    </p>
                    <div className="nl-meta">
                        <span className="nl-badge">Q {questionIndex + 1} / {TOTAL_QUESTIONS}</span>
                        <span className="nl-badge">Avg Error: {errors.length > 0 ? (errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(1) : '-'}</span>
                    </div>
                    <div className="nl-progress-track">
                        <div className="nl-progress-fill" style={{ width: `${(questionIndex / TOTAL_QUESTIONS) * 100}%` }} />
                    </div>
                </header>

                <div className="nl-interactive-area">
                    <h1 className="nl-target-display">{target}</h1>

                    <div className="nl-scale-container" onClick={handleClick}>
                        {/* The actual base line */}
                        <div className="nl-base-line" />

                        {/* Ticks and Labels */}
                        {allTicks.map((tick) => {
                            const isMajor = tick % 10 === 0;
                            const isMid = tick % 5 === 0 && !isMajor;
                            const tickClass = isMajor ? 'major' : isMid ? 'mid' : 'minor';
                            
                            return (
                                <div key={tick} className={`nl-tick-wrapper ${tickClass}`} style={{ left: `${tick}%` }}>
                                    <div className={`nl-tick-mark ${tickClass}`} />
                                    {isMajor && <span className="nl-tick-label">{tick}</span>}
                                </div>
                            );
                        })}

                        {/* Markers (Only show when answered) */}
                        {answered && (
                            <>
                                {/* User's Guess Marker */}
                                <div className="nl-marker user-marker" style={{ left: `${userEstimate}%` }}>
                                    <div className="nl-marker-pin" />
                                    <div className="nl-marker-label">You: {userEstimate}</div>
                                </div>

                                {/* Actual Target Marker */}
                                <div className="nl-marker target-marker" style={{ left: `${target}%` }}>
                                    <div className="nl-marker-pin" />
                                    <div className="nl-marker-label">Exact: {target}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="nl-feedback" aria-live="polite">
                    {answered && (
                        <div className={`nl-feedback-pill ${actualError <= 5 ? 'excellent' : actualError <= 15 ? 'good' : 'poor'}`}>
                            {actualError === 0 ? "Perfect!" : `Off by ${actualError}`}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

/* ─────────────────────────────────────────────
   SCOPED STYLES
───────────────────────────────────────────── */
function NumberLineStyles() {
    return (
        <style>{`
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes popIn {
        0% { opacity: 0; transform: scale(0.5) translate(-50%, -100%); }
        60% { transform: scale(1.1) translate(-50%, -100%); }
        100% { opacity: 1; transform: scale(1) translate(-50%, -100%); }
      }

      .nl-root {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        width: 100%; min-height: 100vh; padding: 40px 20px;
        animation: fadeSlideIn 0.5s ease both;
        box-sizing: border-box;
      }

      .nl-header {
        width: 100%; max-width: 600px;
        display: flex; flex-direction: column; align-items: center; gap: 12px;
        z-index: 10;
      }

      .nl-instruction { font-size: 1.3rem; color: var(--text-h); margin: 0; }
      .nl-instruction strong { color: var(--accent); font-size: 1.5rem; }

      .nl-meta { display: flex; gap: 12px; }
      .nl-badge {
        font-size: 0.85rem; font-weight: 600; padding: 5px 16px;
        border-radius: 99px; background: var(--accent-bg); color: var(--accent);
        border: 1px solid var(--accent-border); letter-spacing: 0.5px;
      }

      .nl-progress-track {
        width: 100%; max-width: 480px; height: 6px;
        background: var(--border); border-radius: 99px; overflow: hidden;
      }
      .nl-progress-fill {
        height: 100%; background: var(--accent); border-radius: 99px;
        transition: width 0.4s ease;
      }

      .nl-interactive-area {
        width: 100%; max-width: 800px;
        margin: 60px 0; display: flex; flex-direction: column; align-items: center;
        background: var(--bg); padding: 50px 30px; border-radius: 24px;
        box-shadow: var(--shadow); border: 1px solid var(--border);
        z-index: 10;
      }

      .nl-target-display {
        font-size: 4rem; font-weight: 800; color: var(--text-h);
        margin: 0 0 50px 0; letter-spacing: -2px;
        text-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .nl-scale-container {
        position: relative; width: 100%; height: 60px;
        cursor: crosshair; user-select: none;
      }
      
      /* Make hover area bigger than the visual line */
      .nl-scale-container::before {
        content: ""; position: absolute; inset: -20px -10px;
        border-radius: 20px; transition: background 0.2s;
      }
      .nl-scale-container:hover::before {
        background: rgba(255, 255, 255, 0.03);
      }

      .nl-base-line {
        position: absolute; top: 50%; left: 0; width: 100%; height: 8px;
        background: var(--border); border-radius: 4px; transform: translateY(-50%);
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
      }

      .nl-tick-wrapper {
        position: absolute; top: 50%; transform: translate(-50%, -50%);
        display: flex; flex-direction: column; align-items: center;
        pointer-events: none;
      }

      .nl-tick-mark {
        background: var(--text); border-radius: 2px;
      }
      
      .nl-tick-mark.major {
        width: 3px; height: 32px; opacity: 0.8;
      }
      
      .nl-tick-mark.mid {
        width: 2px; height: 18px; opacity: 0.5;
      }
      
      .nl-tick-mark.minor {
        width: 1px; height: 10px; opacity: 0.25;
      }

      .nl-tick-label {
        margin-top: 10px; font-size: 0.9rem; font-weight: 600; color: var(--text);
      }

      .nl-marker {
        position: absolute; top: 50%; pointer-events: none;
        display: flex; flex-direction: column; align-items: center;
        animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        z-index: 20;
      }

      .nl-marker-pin {
        width: 16px; height: 16px; border-radius: 50%;
        border: 3px solid #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      }

      .nl-marker-label {
        position: absolute; bottom: 24px; white-space: nowrap;
        padding: 4px 10px; border-radius: 8px; font-size: 0.85rem; font-weight: bold;
        color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      }

      .user-marker .nl-marker-pin { background: #ef4444; }
      .user-marker .nl-marker-label { background: #ef4444; }

      .target-marker .nl-marker-pin { background: #22c55e; }
      .target-marker .nl-marker-label { background: #22c55e; }

      .target-marker { animation-delay: 0.15s; z-index: 15; opacity: 0.9; }

      .nl-feedback {
        min-height: 48px; display: flex; align-items: center; justify-content: center;
        z-index: 10; margin-top: -20px;
      }

      .nl-feedback-pill {
        padding: 8px 24px; border-radius: 99px; font-weight: 700; font-size: 1.1rem;
        animation: fadeSlideIn 0.3s ease both; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        color: #fff;
      }

      .nl-feedback-pill.excellent { background: #22c55e; }
      .nl-feedback-pill.good { background: #eab308; }
      .nl-feedback-pill.poor { background: #ef4444; }
    `}</style>
    );
}
