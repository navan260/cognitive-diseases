import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DotTest from "./DotTest"
import NumberLineTest from "./NumberLineTest"
import ArithmeticTest from "./ArithmeticTest"
import { analyzeDotTest, analyzeNumberLineTest, analyzeArithmeticTest } from "../engine/resultEngine"
import { useEffect } from "react";

export default function SmartTest() {
    const { testType } = useParams()
    const navigate = useNavigate()
    const [result, setResult] = useState(null)
    const [summary, setSummary] = useState(null)

    // This function receives data from the active test
  const handleFinish = async (data) => {
    let analysis;

    if (testType === 'numberline') {
        analysis = analyzeNumberLineTest(data)
    } else if (testType === 'arithmetic') {
        analysis = analyzeArithmeticTest(data)
    } else {
        analysis = analyzeDotTest(data)
    }

    setResult(analysis)

    // 🔥 AI CALL
    try {
        const res = await fetch("http://localhost:5000/summary", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                dot: data,
                line: data,
                arithmetic: data,
                prediction: analysis.level
            })
        })

        const ai = await res.json()
        setSummary(ai.text)

    } catch {
        setSummary("AI summary failed")
    }
}

    // If result exists → show analysis
    if (result) {
        const getLevelColor = (level) => {
            if (level === "strong") return "#22c55e";
            if (level === "medium") return "#eab308";
            return "#ef4444";
        };

        const getLevelLabel = (level) => {
            if (level === "strong") return "Excellent";
            if (level === "medium") return "Good";
            return "Needs Practice";
        };

        return (
            <div className="result-screen">
                <div className="result-card">
                    {/* HEADER */}
                    <div className="result-header">
                        <h2 className="result-title">Your Analysis</h2>
                        <p className="result-subtitle">Test completed! Here's your performance summary</p>
                    </div>

                    {/* PERFORMANCE LEVEL BADGE */}
                    <div className="performance-badge" style={{ borderColor: getLevelColor(result.level) }}>
                        <div className="level-circle" style={{ backgroundColor: getLevelColor(result.level) }}>
                            {result.level === "strong" ? "⭐" : result.level === "medium" ? "✨" : "🎯"}
                        </div>
                        <div>
                            <div className="level-label">{getLevelLabel(result.level)}</div>
                            <div className="level-message">{result.message}</div>
                        </div>
                    </div>

                    {/* SPEED STAT */}
                    <div className="stat-box">
                        <span className="stat-label">⏱️ Processing Speed</span>
                        <span className="stat-value">{result.speed}</span>
                    </div>

                    {/* AI SUMMARY SECTION */}
                    <div className="ai-section">
                        <h3 className="section-title">🧠 AI Insight</h3>
                        <div className="ai-content">
                            <p>{summary || "Generating AI insight..."}</p>
                        </div>
                    </div>

                    {/* RECOMMENDATIONS SECTION */}
                    <div className="recommendations-section">
                        <h3 className="section-title">💡 What We Recommend</h3>
                        <ul className="recommendations-list">
                            {result.level === "weak" && (
                                <>
                                    <li>✓ Use visual blocks for numbers</li>
                                    <li>✓ Break problems into small steps</li>
                                    <li>✓ Practice estimating quantities</li>
                                </>
                            )}

                            {result.level === "medium" && (
                                <>
                                    <li>✓ Practice quick mental math</li>
                                    <li>✓ Try number line exercises</li>
                                    <li>✓ Increase speed gradually</li>
                                </>
                            )}

                            {result.level === "strong" && (
                                <>
                                    <li>✓ Challenge with harder problems</li>
                                    <li>✓ Try multi-step calculations</li>
                                    <li>✓ Improve speed further</li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="button-group">
                        <button
                            onClick={() => {
                                setResult(null)
                                setSummary(null)
                            }}
                            className="btn btn-primary"
                        >
                            🔁 Try Again
                        </button>
                        <button onClick={() => navigate('/')} className="btn btn-secondary">
                            🏠 Back to Home
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Otherwise → show test
    if (testType === 'numberline') {
        return <NumberLineTest onFinish={handleFinish} />
    }

    if (testType === 'arithmetic') {
        return <ArithmeticTest onFinish={handleFinish} />
    }

    // Default to DotTest
    return <DotTest onFinish={handleFinish} />
}
