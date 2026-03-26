import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DotTest from "./DotTest"
import NumberLineTest from "./NumberLineTest"
import { analyzeDotTest, analyzeNumberLineTest } from "../engine/resultEngine"

export default function SmartTest() {
    const { testType } = useParams()
    const navigate = useNavigate()
    const [result, setResult] = useState(null)

    // This function receives data from the active test
    const handleFinish = (data) => {
        let analysis;
        if (testType === 'numberline') {
            analysis = analyzeNumberLineTest(data)
        } else {
            analysis = analyzeDotTest(data)
        }
        setResult(analysis)
    }

    // If result exists → show analysis
    if (result) {
        return (
            <div className="result-screen">
                <div className="result-card">
                    <h2 className="result-title"> Your Analysis</h2>

                    <p className="result-message">{result.message}</p>

                    <p className="result-speed">
                        Processing Speed: <b>{result.speed}</b>
                    </p>

                    <div className="suggestions">
                        <h3> What we recommend:</h3>

                        {result.level === "weak" && (
                            <ul>
                                <li>Use visual blocks for numbers</li>
                                <li>Break problems into small steps</li>
                                <li>Practice estimating quantities</li>
                            </ul>
                        )}

                        {result.level === "medium" && (
                            <ul>
                                <li>Practice quick mental math</li>
                                <li>Try number line exercises</li>
                                <li>Increase speed gradually</li>
                            </ul>
                        )}

                        {result.level === "strong" && (
                            <ul>
                                <li>Challenge with harder problems</li>
                                <li>Try multi-step calculations</li>
                                <li>Improve speed further</li>
                            </ul>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
                        <button onClick={() => setResult(null)} className="restart-btn" style={{ margin: 0 }}>
                            🔁 Try Again
                        </button>
                        <button onClick={() => navigate('/')} className="restart-btn" style={{ margin: 0, background: '#475569' }}>
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
    
    // Default to DotTest
    return <DotTest onFinish={handleFinish} />
}