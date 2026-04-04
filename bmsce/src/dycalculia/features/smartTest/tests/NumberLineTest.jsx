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
        <div className="nl-root">
            <header className="nl-header">
                <p className="nl-instruction" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
                    Where does <span style={{ color: '#3b82f6', fontWeight: '800', fontSize: '1.6rem' }}>{target}</span> belong on the line?
                </p>
                <div className="nl-meta">
                    <span className="nl-badge">Question {questionIndex + 1} / {TOTAL_QUESTIONS}</span>
                    <span className="nl-badge">Avg Error: {errors.length > 0 ? (errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(1) : '-'}</span>
                </div>
                <div className="nl-progress-track">
                    <div className="nl-progress-fill" style={{ width: `${((questionIndex + 1) / TOTAL_QUESTIONS) * 100}%` }} />
                </div>
            </header>

            <div className="nl-interactive-area" style={{ background: 'transparent', border: 'none', boxShadow: 'none', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 className="nl-target-display">{target}</h1>

                <div className="nl-scale-container" onClick={handleClick}>
                    <div className="nl-base-line" />

                    {allTicks.map((tick) => {
                        const isMajor = tick % 10 === 0;
                        const isMid = tick % 5 === 0 && !isMajor;
                        const tickClass = isMajor ? 'major' : isMid ? 'mid' : 'minor';
                        
                        return (
                            <div key={tick} className={`nl-tick-wrapper`} style={{ left: `${tick}%`, position: 'absolute' }}>
                                <div className={`nl-tick-mark ${tickClass}`} />
                                {isMajor && <span className="nl-tick-label">{tick}</span>}
                            </div>
                        );
                    })}

                    {answered && (
                        <>
                            <div className="nl-marker user-marker" style={{ left: `${userEstimate}%` }}>
                                <div className="nl-marker-pin" />
                                <div className="nl-marker-label">You: {userEstimate}</div>
                            </div>

                            <div className="nl-marker target-marker" style={{ left: `${target}%` }}>
                                <div className="nl-marker-pin" />
                                <div className="nl-marker-label">Exact: {target}</div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="nl-feedback" style={{ minHeight: '60px', marginTop: '40px' }}>
                {answered && (
                    <div 
                        className="nl-feedback-pill" 
                        style={{ 
                            background: actualError <= 5 ? '#10b981' : actualError <= 15 ? '#f59e0b' : '#ef4444',
                            padding: '12px 32px',
                            borderRadius: '99px',
                            fontWeight: '800',
                            fontSize: '1.2rem',
                            color: 'white',
                            animation: 'dy-fade-in-up 0.3s ease'
                        }}
                    >
                        {actualError === 0 ? "🎯 Perfect Accuracy!" : `Off by ${actualError}`}
                    </div>
                )}
            </div>
        </div>
    );
}
