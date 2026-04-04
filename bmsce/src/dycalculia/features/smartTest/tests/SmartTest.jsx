import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DotTest from "./DotTest"
import NumberLineTest from "./NumberLineTest"
import ArithmeticTest from "./ArithmeticTest"
import { analyzeDotTest, analyzeNumberLineTest, analyzeArithmeticTest } from "../engine/resultEngine"
import "../../../pages/dyscalculia.css"
import { useLanguage } from "@/LanguageContext"
import { languages } from "@/translations"
import { Link } from "react-router-dom"

export default function SmartTest() {
    const { testType } = useParams()
    const navigate = useNavigate()
    const { language, changeLanguage, t } = useLanguage()
    const [result, setResult] = useState(null)
    const [summary, setSummary] = useState(null)

    const dyscalculiaNavbar = (
        <nav className="dy-navbar">
            <Link to="/dashboard" className="dy-nav-logo" style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'white', textDecoration: 'none' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54Z" />
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54Z" />
                </svg>
                DDAP
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/dycalculia" className="back-dashboard-btn">
                    ← {t("backToDashboard") || "Back to Dashboard"}
                </Link>
            </div>
        </nav>
    );

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

        try {
            const res = await fetch("http://localhost:5000/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
            setSummary("AI analysis summary is being finalized. Please check your dashboard for full details shortly.")
        }
    }

    if (result) {
        const getLevelColor = (level) => {
            if (level === "strong") return "#10b981";
            if (level === "medium") return "#f59e0b";
            return "#ef4444";
        };

        const getLevelLabel = (level) => {
            if (level === "strong") return "Excellent Progress";
            if (level === "medium") return "Consistent Effort";
            return "Needs Practice";
        };

        return (
            <div className="dycalculia-wrapper">
                <div className="snow-background"></div>
                {dyscalculiaNavbar}
                <div className="dy-container">
                    <div className="dy-panel dy-result-card">
                        <header className="dy-header" style={{ marginBottom: '40px' }}>
                            <h2 className="dy-title" style={{ fontSize: '2.5rem' }}>Diagnostic Analysis</h2>
                            <p className="dy-subtitle">Assessment complete. Here is your personalized performance breakdown.</p>
                        </header>

                        <div className="dy-performance-badge" style={{ borderLeft: `6px solid ${getLevelColor(result.level)}` }}>
                            <div className="dy-level-circle" style={{ backgroundColor: `${getLevelColor(result.level)}20`, color: getLevelColor(result.level) }}>
                                {result.level === "strong" ? "⭐" : result.level === "medium" ? "✨" : "🎯"}
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.25rem', color: getLevelColor(result.level) }}>{getLevelLabel(result.level)}</h4>
                                <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{result.message}</p>
                            </div>
                        </div>

                        <div className="dy-stat-grid">
                            <div className="dy-stat-box">
                                <span style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '8px' }}>⏱️ Processing Speed</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6' }}>{result.speed}</span>
                            </div>
                        </div>

                        <div className="dy-insight-panel">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', marginBottom: '16px' }}>
                                <span style={{ fontSize: '1.4rem' }}>🧠</span> AI Insight
                            </h3>
                            <p style={{ lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                                {summary || "Analyzing your cognitive patterns and generating deep insights..."}
                            </p>
                        </div>

                        <div style={{ marginTop: '40px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>💡 Personalized Recommendations</h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {(result.level === "weak" ? ["Use visual blocks for numbers", "Break problems into small steps", "Practice estimating quantities"] :
                                  result.level === "medium" ? ["Practice quick mental math", "Try number line exercises", "Increase speed gradually"] :
                                  ["Challenge with harder problems", "Try multi-step calculations", "Improve speed further"]).map((rec, i) => (
                                    <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
                                        <span style={{ color: '#10b981' }}>✓</span> {rec}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '48px', display: 'flex', gap: '16px' }}>
                            <button 
                                onClick={() => { setResult(null); setSummary(null); }}
                                style={{
                                    flex: 1, padding: '16px', borderRadius: '16px', background: '#3b82f6', color: 'white',
                                    border: 'none', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease'
                                }}
                            >
                                🔁 Retake Assessment
                            </button>
                            <button 
                                onClick={() => navigate('/dycalculia', { replace: true })}
                                style={{
                                    flex: 1, padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: 'white',
                                    border: '1px solid rgba(255,255,255,0.1)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease'
                                }}
                            >
                                🏠 Module Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="dycalculia-wrapper">
            <div className="snow-background"></div>
            {dyscalculiaNavbar}
            <div className="dy-container">
                <div className="dy-panel">
                    {testType === 'numberline' ? <NumberLineTest onFinish={handleFinish} /> :
                     testType === 'arithmetic' ? <ArithmeticTest onFinish={handleFinish} /> :
                     <DotTest onFinish={handleFinish} />}
                </div>
            </div>
        </div>
    )
}
