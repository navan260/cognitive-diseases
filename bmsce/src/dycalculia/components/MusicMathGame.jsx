import React, { useState, useRef, useEffect } from "react";
import "../pages/dyscalculia.css";

export default function MusicMathGame({ onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [currentNum1, setCurrentNum1] = useState(0);
  const [currentNum2, setCurrentNum2] = useState(0);
  const [beats, setBeats] = useState([]);
  const [isPlayingBeats, setIsPlayingBeats] = useState(false);
  const [taps, setTaps] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [questionCount, setQuestionCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [rhythmAnalysis, setRhythmAnalysis] = useState("");
  const [operationType, setOperationType] = useState("addition");
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customNum1, setCustomNum1] = useState("");
  const [customNum2, setCustomNum2] = useState("");
  const [customOperation, setCustomOperation] = useState("addition");
  const [lastBeatsData, setLastBeatsData] = useState(null);
  const audioContextRef = useRef(null);
  const beatTimeoutRef = useRef(null);
  const listenTimeoutRef = useRef(null);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return () => {
      if (beatTimeoutRef.current) clearTimeout(beatTimeoutRef.current);
      if (listenTimeoutRef.current) clearTimeout(listenTimeoutRef.current);
    };
  }, []);

  // Generate new question based on difficulty and operation
  const generateQuestion = (operation = "addition") => {
    let num1, num2, answer, questionText;
    const maxNum = 3 + difficulty;

    num1 = Math.floor(Math.random() * maxNum) + 1;
    num2 = Math.floor(Math.random() * maxNum) + 1;

    switch (operation) {
      case "addition":
        answer = num1 + num2;
        questionText = `${num1} + ${num2}`;
        break;
      case "multiplication":
        answer = num1 * num2;
        questionText = `${num1} × ${num2}`;
        break;
      case "division":
        answer = Math.floor(num1 * num2 / num1);
        questionText = `${num1 * num2} ÷ ${num1}`;
        break;
      default:
        answer = num1 + num2;
        questionText = `${num1} + ${num2}`;
    }

    setCurrentQuestion(questionText);
    setCorrectAnswer(answer);
    setOperationType(operation);
    setBeats([]);
    setTaps([]);
    setFeedback("");
    setShowResults(false);
    setRhythmAnalysis("");

    return { num1, num2, answer, operation };
  };

  // Play sound using Web Audio API
  const playBeep = (frequency = 400, duration = 100) => {
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  };

  // Play beats for the numbers with operation-specific frequencies
  const playBeatsSequence = async (num1, num2, operation = "addition") => {
    setIsPlayingBeats(true);
    const ctx = audioContextRef.current;
    const beatDuration = 200;
    const beatGap = 400;  // Increased gap for clarity
    const sequenceGap = 800;  // Increased gap between numbers

    // Store data for restart
    setLastBeatsData({ num1, num2, operation });

    // Different frequencies for different operations
    let freq1 = 400;  // Addition
    let freq2 = 600;
    
    if (operation === "multiplication") {
      freq1 = 500;   // Multiplication
      freq2 = 700;
    } else if (operation === "division") {
      freq1 = 550;   // Division
      freq2 = 650;
    }

    // Helper function to play a single beat with visual feedback
    const playBeat = (freq, beatId) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          playBeep(freq, beatDuration);
          setBeats((prev) => [...prev, { id: beatId, active: true }]);

          setTimeout(() => {
            setBeats((prev) => prev.filter((b) => b.id !== beatId));
          }, beatDuration);

          resolve();
        }, beatGap);
      });
    };

    // Play beats for first number
    for (let i = 0; i < num1; i++) {
      await playBeat(freq1, `b1-${i}-${Date.now()}`);
    }

    // Gap between first and second number
    await new Promise((resolve) => {
      setTimeout(resolve, sequenceGap);
    });

    // Play beats for second number
    for (let i = 0; i < num2; i++) {
      await playBeat(freq2, `b2-${i}-${Date.now()}`);
    }

    setIsPlayingBeats(false);
    setIsListening(true);
    setTaps([]);

    // Auto-submit after timeout
    listenTimeoutRef.current = setTimeout(() => {
      setIsListening(false);
    }, 5000);
  };

  // Handle user tap
  const handleTap = () => {
    if (!isListening) return;

    const ctx = audioContextRef.current;
    const currentTime = ctx.currentTime * 1000;
    const newTaps = [...taps, currentTime];
    setTaps(newTaps);

    // Visual feedback
    setBeats((prev) => [...prev, { id: `tap-${Date.now()}`, active: true, isTap: true }]);
    setTimeout(() => {
      setBeats((prev) => prev.filter((b) => b.id !== `tap-${Date.now()}`));
    }, 80);

    playBeep(800, 80);

    // Auto-submit after last tap (wait 1.5s for next tap)
    if (listenTimeoutRef.current) clearTimeout(listenTimeoutRef.current);
    listenTimeoutRef.current = setTimeout(() => {
      submitAnswer(newTaps);
    }, 1500);
  };

  // Analyze rhythm timing
  const analyzeRhythm = (tapArray) => {
    if (tapArray.length < 2) return "";

    const intervals = [];
    for (let i = 1; i < tapArray.length; i++) {
      intervals.push(tapArray[i] - tapArray[i - 1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;

    const stdDev = Math.sqrt(variance);
    const consistency = stdDev < 150; // Good if std dev < 150ms

    if (!consistency) {
      return "Timing is inconsistent. Try to tap with even rhythm!";
    }
    return "Great rhythm consistency!";
  };

  // Calculate level based on streak
  const calculateLevel = (currentStreak) => {
    // Level progression: 
    // Level 1: 0-4 streak
    // Level 2: 5-9 streak
    // Level 3: 10-14 streak
    // Level 4: 15-19 streak
    // Level 5: 20+ streak
    return Math.floor(currentStreak / 5) + 1;
  };

  // Submit answer
  const submitAnswer = (tapArray) => {
    setIsListening(false);
    if (beatTimeoutRef.current) clearTimeout(beatTimeoutRef.current);
    if (listenTimeoutRef.current) clearTimeout(listenTimeoutRef.current);

    const userAnswer = tapArray.length;
    const isCorrect = userAnswer === correctAnswer;

    let analysis = "";
    let newFeedback = "";
    let newFeedbackType = "";

    if (userAnswer === 0) {
      newFeedback = "No taps detected. Try again!";
      newFeedbackType = "error";
    } else if (userAnswer > correctAnswer) {
      const diff = userAnswer - correctAnswer;
      newFeedback = `You tapped ${diff} too many times. You rushed!`;
      newFeedbackType = "incorrect";
      analysis = "⚡ Overestimation - You counted more beats than needed";
    } else if (userAnswer < correctAnswer) {
      const diff = correctAnswer - userAnswer;
      newFeedback = `You missed ${diff} beats. Listen carefully!`;
      newFeedbackType = "incorrect";
      analysis = "🐢 Underestimation - You didn't count all the beats";
    } else {
      newFeedback = "Perfect! Great timing!";
      newFeedbackType = "success";
      analysis = analyzeRhythm(tapArray);
    }

    setFeedback(newFeedback);
    setFeedbackType(newFeedbackType);
    setRhythmAnalysis(analysis);
    setShowResults(true);

    // Update score and streak
    if (isCorrect) {
      setScore((prev) => prev + 10 + difficulty * 2);
      setStreak((prev) => prev + 1);
      // Update level based on new streak
      setLevel(calculateLevel(streak + 1));
    } else {
      setStreak(0);
      setLevel(1);
    }

    // Increase difficulty every 3 correct answers
    if (streak > 0 && streak % 3 === 0) {
      setDifficulty((prev) => Math.min(prev + 1, 5));
    }
  };

  // Start the game with selected operation
  const startGame = () => {
    const operation = selectedOperation || "addition";
    const { num1, num2, answer } = generateQuestion(operation);
    setQuestionCount(1);
    
    // Store original numbers for retry
    setCurrentNum1(num1);
    setCurrentNum2(num2);
    setOperationType(operation);
    
    // Calculate the actual beat numbers based on operation
    let beatNum1 = num1;
    let beatNum2 = num2;
    
    if (operation === "division") {
      beatNum1 = num1 * num2;  // dividend
      beatNum2 = num1;         // divisor
    }
    
    playBeatsSequence(beatNum1, beatNum2, operation);
  };

  // Next question with same operation
  const nextQuestion = () => {
    const { num1, num2, answer } = generateQuestion(operationType);
    setQuestionCount((prev) => prev + 1);
    
    // Store original numbers for retry
    setCurrentNum1(num1);
    setCurrentNum2(num2);
    
    // Calculate the actual beat numbers based on operation
    let beatNum1 = num1;
    let beatNum2 = num2;
    
    if (operationType === "division") {
      beatNum1 = num1 * num2;  // dividend
      beatNum2 = num1;         // divisor
    }
    
    playBeatsSequence(beatNum1, beatNum2, operationType);
  };

  // Restart beats
  const restartBeats = async () => {
    if (lastBeatsData) {
      setIsListening(false);
      setTaps([]);
      await playBeatsSequence(lastBeatsData.num1, lastBeatsData.num2, lastBeatsData.operation);
    }
  };

  // Create custom question
  const createCustomQuestion = () => {
    const num1 = parseInt(customNum1);
    const num2 = parseInt(customNum2);

    if (!customNum1 || !customNum2 || isNaN(num1) || isNaN(num2) || num1 <= 0 || num2 <= 0) {
      alert("Please enter valid positive numbers");
      return;
    }

    let answer, questionText;

    switch (customOperation) {
      case "addition":
        answer = num1 + num2;
        questionText = `${num1} + ${num2}`;
        break;
      case "multiplication":
        answer = num1 * num2;
        questionText = `${num1} × ${num2}`;
        break;
      case "division":
        answer = Math.floor(num2 / num1);
        questionText = `${num2} ÷ ${num1}`;
        break;
      default:
        answer = num1 + num2;
        questionText = `${num1} + ${num2}`;
    }

    setCurrentQuestion(questionText);
    setCorrectAnswer(answer);
    setCurrentNum1(num1);
    setCurrentNum2(num2);
    setOperationType(customOperation);
    setBeats([]);
    setTaps([]);
    setFeedback("");
    setShowResults(false);
    setRhythmAnalysis("");
    setQuestionCount((prev) => prev + 1);
    setShowCustomInput(false);

    playBeatsSequence(num1, num2, customOperation);
  };

  // Retry current question
  const retryQuestion = async () => {
    setShowResults(false);
    setIsListening(false);
    setTaps([]);
    setBeats([]);
    setFeedback("");
    setFeedbackType("");
    setRhythmAnalysis("");
    
    // Calculate beat numbers based on operation
    let beatNum1 = currentNum1;
    let beatNum2 = currentNum2;
    
    if (operationType === "division") {
      beatNum1 = currentNum1 * currentNum2;  // dividend
      beatNum2 = currentNum1;                 // divisor
    }
    
    // Re-play beats for the same question
    await playBeatsSequence(beatNum1, beatNum2, operationType);
  };

  // Operation selector component
  const OperationSelector = () => (
    <div style={styles.operationSelector}>
      <p style={styles.operationLabel}>Choose Math Operation:</p>
      <div style={styles.operationButtons}>
        <button
          onClick={() => setSelectedOperation("addition")}
          style={{
            ...styles.opButton,
            ...(selectedOperation === "addition" ? styles.opButtonActive : {}),
          }}
        >
          ➕ Addition<br/>
          <span style={styles.opNote}>(400 & 600 Hz)</span>
        </button>
        <button
          onClick={() => setSelectedOperation("multiplication")}
          style={{
            ...styles.opButton,
            ...(selectedOperation === "multiplication" ? styles.opButtonActive : {}),
          }}
        >
          ✖️ Multiplication<br/>
          <span style={styles.opNote}>(500 & 700 Hz)</span>
        </button>
        <button
          onClick={() => setSelectedOperation("division")}
          style={{
            ...styles.opButton,
            ...(selectedOperation === "division" ? styles.opButtonActive : {}),
          }}
        >
          ➗ Division<br/>
          <span style={styles.opNote}>(350 & 550 Hz)</span>
        </button>
      </div>
    </div>
  );

  // Custom input component
  const CustomInputForm = () => (
    <div style={styles.customInputContainer}>
      <h3 style={styles.customTitle}>Create Custom Question</h3>
      <div style={styles.customForm}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Number 1:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={customNum1}
            onChange={(e) => setCustomNum1(e.target.value)}
            style={styles.input}
            placeholder="Enter first number"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Operation:</label>
          <select
            value={customOperation}
            onChange={(e) => setCustomOperation(e.target.value)}
            style={styles.select}
          >
            <option value="addition">➕ Addition</option>
            <option value="multiplication">✖️ Multiplication</option>
            <option value="division">➗ Division</option>
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Number 2:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={customNum2}
            onChange={(e) => setCustomNum2(e.target.value)}
            style={styles.input}
            placeholder="Enter second number"
          />
        </div>
      </div>

      <div style={styles.customButtonGroup}>
        <button onClick={createCustomQuestion} style={styles.customStartButton}>
          Start Custom Question 🎵
        </button>
        <button onClick={() => setShowCustomInput(false)} style={styles.customCancelButton}>
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="dycalculia-wrapper" style={styles.container}>
      <div className="snow-background"></div>
      <style>{containerStyles}</style>

      <div style={{ marginTop: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={styles.gameCard}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🎵 Music Math Game</h1>
            <p style={styles.subtitle}>Count beats to solve math problems</p>
          </div>
          <div style={styles.statsBox}>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Score</span>
              <span style={styles.statValue}>{score}</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Streak</span>
              <span style={styles.statValue}>{streak}</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statLabel}>🏆 Level</span>
              <span style={styles.statValue}>{level}</span>
            </div>
          </div>
          <div style={styles.levelProgressContainer}>
            <div style={styles.levelProgressLabel}>
              Level {level} Progress: {streak % 5} / 5 Streak
            </div>
            <div style={styles.levelProgressBar}>
              <div 
                style={{
                  ...styles.levelProgressFill,
                  width: `${(streak % 5) * 20}%`
                }}
              />
            </div>
          </div>
        </div>

        {!currentQuestion ? (
          showCustomInput ? (
            <CustomInputForm />
          ) : (
            <div style={styles.startSection}>
              <div style={styles.startIcon}>🎮</div>
              <h2>Ready to play?</h2>
              <p>Listen to beats, count them, and tap the answer!</p>
              <OperationSelector />
              <div style={styles.startButtonGroup}>
                <button 
                  onClick={startGame} 
                  disabled={!selectedOperation}
                  style={{ ...styles.startButton, ...(selectedOperation ? {} : styles.startButtonDisabled) }}
                >
                  Start Game 🎵
                </button>
                <button 
                  onClick={() => setShowCustomInput(true)}
                  style={styles.customButton}
                >
                  ✏️ Custom Question
                </button>
              </div>
            </div>
          )
        ) : (
          <div style={styles.gameSection}>
            <div style={styles.questionBox}>
              <div style={styles.questionLabel}>Question:</div>
              <div style={styles.questionText}>{currentQuestion}</div>
            </div>

            <div style={styles.beatVisualizerContainer}>
              <div style={styles.beatVisualizer}>
                {beats.map((beat, idx) => (
                  <div
                    key={beat.id}
                    style={{
                      ...styles.beatDot,
                      ...(beat.active ? styles.beatDotActive : {}),
                      ...(beat.isTap ? styles.beatDotTap : {}),
                    }}
                  />
                ))}
              </div>
            </div>

            {isPlayingBeats && (
              <div style={styles.statusMessage}>🔊 Playing beats...</div>
            )}

            {isListening && !showResults && (
              <div style={styles.tapSection}>
                <div style={styles.tapInstruction}>Tap to count beats:</div>
                <button onClick={handleTap} style={styles.tapButton}>
                  👆 TAP HERE
                </button>
                <div style={styles.tapCounter}>Taps: {taps.length}</div>
                <button onClick={restartBeats} style={styles.restartButton}>
                  🔄 Replay Beats
                </button>
              </div>
            )}

            {showResults && (
              <div
                style={{
                  ...styles.resultsBox,
                  ...styles[`resultsBox${feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)}`],
                }}
              >
                <div style={styles.feedbackText}>{feedback}</div>
                {rhythmAnalysis && (
                  <div style={styles.analysisText}>{rhythmAnalysis}</div>
                )}
                <div style={styles.resultDetails}>
                  Your answer: <strong>{taps.length}</strong> | Correct answer: <strong>{correctAnswer}</strong>
                </div>
                <div style={styles.resultButtonGroup}>
                  <button onClick={retryQuestion} style={styles.retryButton}>
                    🔁 Retry Question
                  </button>
                  <button onClick={nextQuestion} style={styles.nextButton}>
                    Next Question ➔
                  </button>
                </div>
              </div>
            )}

            {isPlayingBeats && (
              <div style={styles.loadingAnimation}>
                <span>●</span><span>●</span><span>●</span>
              </div>
            )}
          </div>
        )}

        <div style={styles.info}>
          <p>💡 Difficulty increases as you get more correct answers in a row!</p>
        </div>
      </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px"
  },
  gameCard: {
    width: "100%",
    maxWidth: "600px",
    background: "var(--dy-glass-bg)",
    backdropFilter: "blur(32px)",
    border: "1px solid var(--dy-glass-border)",
    borderRadius: "32px",
    padding: "40px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    color: "var(--dy-text-primary)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "40px"
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "white",
    margin: "0 0 8px"
  },
  subtitle: {
    fontSize: "14px",
    color: "#cbd5e1",
    margin: "0"
  },
  statsBox: {
    display: "flex",
    gap: "16px"
  },
  stat: {
    background: "rgba(255, 255, 255, 0.02)",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid var(--dy-glass-border)",
    textAlign: "center"
  },
  statLabel: {
    display: "block",
    fontSize: "12px",
    color: "#cbd5e1",
    marginBottom: "4px"
  },
  statValue: {
    display: "block",
    fontSize: "20px",
    fontWeight: "700",
    color: "#3b82f6"
  },
  levelProgressContainer: {
    marginTop: "20px",
    padding: "12px 16px",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "12px",
    border: "1px solid var(--dy-glass-border)"
  },
  levelProgressLabel: {
    fontSize: "12px",
    color: "#cbd5e1",
    marginBottom: "8px",
    textAlign: "center",
    fontWeight: "600"
  },
  levelProgressBar: {
    height: "8px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "4px",
    overflow: "hidden",
    border: "none"
  },
  levelProgressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)",
    transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 0 10px rgba(16, 185, 129, 0.6)"
  },
  startSection: {
    textAlign: "center",
    padding: "60px 20px"
  },
  startIcon: {
    fontSize: "80px",
    marginBottom: "20px",
    animation: "bounce 2s infinite"
  },
  startButton: {
    marginTop: "20px",
    padding: "16px 32px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)"
  },
  gameSection: {
    animation: "fadeIn 0.5s ease"
  },
  questionBox: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid var(--dy-glass-border)",
    borderRadius: "24px",
    padding: "32px",
    marginBottom: "30px",
    textAlign: "center"
  },
  questionLabel: {
    fontSize: "12px",
    color: "#cbd5e1",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "1px"
  },
  questionText: {
    fontSize: "48px",
    fontWeight: "700",
    color: "white",
    fontVariantNumeric: "tabular-nums"
  },
  beatVisualizerContainer: {
    marginBottom: "30px",
    display: "flex",
    justifyContent: "center"
  },
  beatVisualizer: {
    display: "flex",
    gap: "12px",
    minHeight: "60px",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    minWidth: "200px"
  },
  beatDot: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.05)",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    transition: "all 0.1s ease"
  },
  beatDotActive: {
    width: "48px",
    height: "48px",
    background: "rgba(59, 130, 246, 0.8)",
    border: "2px solid #3b82f6",
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)"
  },
  beatDotTap: {
    background: "rgba(16, 185, 129, 0.8)",
    border: "2px solid #10b981",
    boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)"
  },
  statusMessage: {
    textAlign: "center",
    color: "#3b82f6",
    fontSize: "14px",
    marginBottom: "20px",
    fontWeight: "600"
  },
  tapSection: {
    textAlign: "center",
    marginBottom: "30px"
  },
  tapInstruction: {
    fontSize: "14px",
    color: "#cbd5e1",
    marginBottom: "16px"
  },
  tapButton: {
    padding: "20px 40px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    fontSize: "20px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
    minWidth: "200px"
  },
  tapCounter: {
    marginTop: "16px",
    fontSize: "14px",
    color: "#3b82f6",
    fontWeight: "600"
  },
  resultsBox: {
    background: "rgba(59, 130, 246, 0.05)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    borderRadius: "24px",
    padding: "32px",
    marginBottom: "30px",
    textAlign: "center"
  },
  resultsBoxSuccess: {
    background: "rgba(16, 185, 129, 0.1)",
    borderColor: "var(--dy-success)"
  },
  resultsBoxIncorrect: {
    background: "rgba(239, 68, 68, 0.1)",
    borderColor: "var(--dy-error)"
  },
  resultsBoxError: {
    background: "rgba(245, 158, 11, 0.1)",
    borderColor: "#f59e0b"
  },
  feedbackText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "white",
    marginBottom: "12px"
  },
  analysisText: {
    fontSize: "14px",
    color: "#cbd5e1",
    marginBottom: "16px",
    fontStyle: "italic"
  },
  resultDetails: {
    fontSize: "14px",
    color: "#cbd5e1",
    marginBottom: "20px"
  },
  resultButtonGroup: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  retryButton: {
    padding: "16px 24px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--dy-glass-border)",
    color: "white",
    borderRadius: "16px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  nextButton: {
    padding: "16px 24px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)"
  },
  loadingAnimation: {
    textAlign: "center",
    marginTop: "20px"
  },
  info: {
    marginTop: "30px",
    padding: "24px",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "20px",
    border: "1px solid var(--dy-glass-border)"
  },
  operationSelector: {
    marginTop: "30px",
    marginBottom: "30px",
    padding: "24px",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "20px",
    border: "1px solid var(--dy-glass-border)"
  },
  operationLabel: {
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    margin: "0 0 20px",
    textAlign: "center"
  },
  operationButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "12px"
  },
  opButton: {
    padding: "16px 12px",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid var(--dy-glass-border)",
    color: "#cbd5e1",
    borderRadius: "16px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minHeight: "80px"
  },
  opButtonActive: {
    background: "rgba(37, 99, 235, 0.2)",
    border: "2px solid #3b82f6",
    color: "white"
  },
  opNote: {
    display: "block",
    fontSize: "11px",
    opacity: 0.7,
    marginTop: "4px",
    fontWeight: "400"
  },
  startButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  },
  startButtonGroup: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    marginTop: "20px",
    flexWrap: "wrap"
  },
  customButton: {
    padding: "16px 32px",
    background: "rgba(255, 255, 255, 0.05)",
    color: "white",
    border: "1px solid var(--dy-glass-border)",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "center"
  },
  customInputContainer: {
    background: "rgba(168, 85, 247, 0.1)",
    border: "2px solid rgba(168, 85, 247, 0.3)",
    borderRadius: "16px",
    padding: "30px",
    textAlign: "center",
    marginTop: "20px"
  },
  customTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "white",
    marginBottom: "20px"
  },
  customForm: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gap: "12px",
    marginBottom: "20px",
    alignItems: "end"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#cbd5e1"
  },
  input: {
    padding: "12px",
    background: "rgba(51, 65, 85, 0.5)",
    border: "2px solid rgba(168, 85, 247, 0.3)",
    borderRadius: "8px",
    color: "white",
    fontSize: "14px",
    transition: "all 0.3s ease"
  },
  select: {
    padding: "12px",
    background: "rgba(51, 65, 85, 0.5)",
    border: "2px solid rgba(168, 85, 247, 0.3)",
    borderRadius: "8px",
    color: "#cbd5e1",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  customButtonGroup: {
    display: "flex",
    gap: "12px",
    justifyContent: "center"
  },
  customStartButton: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(147, 51, 234, 0.4)"
  },
  customCancelButton: {
    padding: "12px 24px",
    background: "rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
    border: "2px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  restartButton: {
    padding: "10px 20px",
    background: "rgba(59, 130, 246, 0.2)",
    color: "#93c5fd",
    border: "2px solid rgba(59, 130, 246, 0.4)",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "12px"
  }

};

const containerStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }

  @keyframes levelUp {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(147, 51, 234, 0.6) !important;
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }
`;
