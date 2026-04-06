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
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/summary`, {
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
            setSummary(t("analyzingPatterns"))
        }
    }

    if (result) {
        const getLevelColor = (level) => {
            if (level === "strong") return "#10b981";
            if (level === "medium") return "#f59e0b";
            return "#ef4444";
        };

        const getLevelLabel = (level) => {
            if (level === "strong") return t("excellentProgress");
            if (level === "medium") return t("consistentEffort");
            return t("needsPractice");
        };

        return (
            <div className="dycalculia-wrapper">
                <div className="snow-background"></div>
                <div className="dy-container">
                    <div className="dy-panel dy-result-card">
                        <header className="dy-header">
                            <h2 className="dy-title">{t("diagnosticAnalysis")}</h2>
                            <p className="dy-subtitle">{t("assessmentComplete")}</p>
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
                                <span style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '8px' }}>⏱️ {t("processingSpeed")}</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6' }}>{result.speed}</span>
                            </div>
                        </div>

                        <div className="dy-insight-panel">
                            <h3><span style={{ fontSize: '1.4rem' }}>🧠</span> {t("aiInsight")}</h3>
                            <p>{summary || t("analyzingPatterns")}</p>
                        </div>

                        <div style={{ marginTop: '40px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>💡 {t("personalizedRecommendations")}</h3>
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

                        <div className="dy-action-bar">
                            <button 
                                onClick={() => { setResult(null); setSummary(null); }}
                                className="dy-btn-primary"
                            >
                                🔁 {t("retakeAssessment")}
                            </button>
                            <button 
                                onClick={() => navigate('/dycalculia', { replace: true })}
                                className="dy-btn-secondary"
                            >
                                🏠 {t("moduleHome")}
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
