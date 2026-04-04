import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { db, auth } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useLanguage } from "@/LanguageContext";
import "./dyslexia.css";

export default function Live() {
    const navigate = useNavigate();
    const { t, isDyslexicFont } = useLanguage();
    const [isRecording, setIsRecording] = useState(false);
    const [liveText, setLiveText] = useState("");
    const [activeTab, setActiveTab] = useState("summary");
    const [loading, setLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [user, setUser] = useState(null);
    const [result, setResult] = useState({
        original: "",
        summary: "",
        syllables: null,
        mindmap: "",
    });

    const recognitionRef = useRef(null);
    const liveTextRef = useRef("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support Speech Recognition. Use Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognitionRef.current = recognition;

        recognition.start();
        setIsRecording(true);
        setLiveText("");
        liveTextRef.current = "";

        recognition.onresult = (event) => {
            let finalTranscript = "";
            let interimTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                const res = event.results[i];
                if (res.isFinal) finalTranscript += res[0].transcript + " ";
                else interimTranscript += res[0].transcript;
            }
            const fullText = finalTranscript + interimTranscript;
            setLiveText(fullText);
            liveTextRef.current = fullText;
        };

        recognition.onerror = (e) => {
            console.error("Speech recognition error:", e.error);
            setIsRecording(false);
        };

        recognition.onend = async () => {
            setIsRecording(false);
            const capturedText = liveTextRef.current;
            if (!capturedText.trim()) return;

            setLoading(true);
            try {
                const res = await fetch("http://127.0.0.1:5000/process", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: capturedText }),
                });
                const data = await res.json();
                setResult({
                    original: data.original || capturedText,
                    summary: data.summary || "No summary returned.",
                    syllables: data.syllables || {},
                    mindmap: data.mindmap || "No mind map returned.",
                });

                if (user) {
                    await addDoc(collection(db, "records"), {
                        userId: user.uid,
                        type: "live",
                        original: data.original || capturedText,
                        summary: data.summary || "No summary returned.",
                        syllables: data.syllables ? (typeof data.syllables === 'string' ? data.syllables : JSON.stringify(data.syllables)) : "",
                        mindmap: data.mindmap || "No flow chart returned.",
                        createdAt: serverTimestamp()
                    });
                }
            } catch (err) {
                console.error("Backend error:", err);
            } finally {
                setLoading(false);
            }
        };
    };

    const handleReadAloud = (text) => {
        if (!window.speechSynthesis) return;
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        if (!text) return;

        const utterance = new window.SpeechSynthesisUtterance(text.replace(/-/g, ' '));
        utterance.rate = 0.9;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const usefulWidth = pageWidth - (margin * 2);

        doc.setFontSize(22);
        doc.setTextColor(59, 130, 246);
        doc.text("Dyslexia Platform - Session Report", pageWidth / 2, 20, { align: "center" });
        doc.line(margin, 25, pageWidth - margin, 25);
        
        let yPos = 40;
        const addSection = (title, content) => {
            if (!content) return;
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(16);
            doc.setTextColor(30, 41, 59);
            doc.setFont("helvetica", "bold");
            doc.text(title, margin, yPos);
            yPos += 10;
            doc.setFontSize(12);
            doc.setTextColor(71, 85, 105);
            doc.setFont("helvetica", "normal");
            const splitText = doc.splitTextToSize(content, usefulWidth);
            doc.text(splitText, margin, yPos);
            yPos += (splitText.length * 7) + 15;
        };

        addSection("Original Transcript", result.original);
        addSection("AI Summary", result.summary);
        addSection("Syllable Breakdown", result.syllables);
        addSection("Process Flow Chart", result.mindmap);
        doc.save(`Dyslexia-Report-${new Date().toLocaleDateString()}.pdf`);
    };

    const stopRecording = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
    };

    const renderFormattedText = (text) => {
        if (!text) return <p style={{ opacity: 0.6 }}>No data available yet.</p>;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        return (
            <ul className="dys-summary-list">
                {lines.map((line, index) => {
                    const cleanLine = line.replace(/^\s*([-•*]|\d+\.)\s*/, '');
                    const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
                    return (
                        <li key={index} className="dys-summary-item">
                            {parts.map((part, i) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                    return <span key={i} className="dys-summary-bold">{part.slice(2, -2)}</span>;
                                }
                                return part;
                            })}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className={`dyslexia-wrapper ${isDyslexicFont ? "opendyslexic-font" : ""}`}>
            <div className="snow-background"></div>

            <nav className="dash-nav">
                <div className="dash-brand" onClick={() => navigate("/")}>
                    <svg className="dash-logo" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54Z" />
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54Z" />
                    </svg>
                    <span className="dash-brand-name">DDAP</span>
                </div>

                <div className="dash-nav-right">
                    <div className="dash-user-badge">
                        <button onClick={() => navigate("/dashboard")} className="dash-logout-link">
                            ← {t("backToDashboard")}
                        </button>
                    </div>
                </div>
            </nav>


            <main className="dys-sub-main">
                <header className="dys-sub-header">
                    <h1 className="dys-sub-title">🎙 {t("liveTranscription")}</h1>
                    
                    <div className="dys-action-bar">
                        {!isRecording ? (
                            <button className="dys-btn-record" onClick={startRecording}>
                                ⏺ {t("clickToRecord")}
                            </button>
                        ) : (
                            <button className="dys-btn-record active" onClick={stopRecording}>
                                ⏹ {t("stopRecording")}
                            </button>
                        )}
                    </div>
                    {isRecording && <p style={{ color: "#f87171", fontSize: "0.9rem" }}>🔴 Listening...</p>}
                </header>

                <div className="dys-layout-grid">
                    <section className="dys-panel">
                        <h3 className="dys-panel-title">📝 Live Transcript</h3>
                        <div className="dys-text-box">
                            {liveText || <span style={{ opacity: 0.4 }}>Start speaking...</span>}
                        </div>
                    </section>

                    <section className="dys-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="dys-tab-group">
                                {["summary", "syllables", "mindmap"].map((tab) => (
                                    <button 
                                        key={tab}
                                        className={`dys-tab-btn ${activeTab === tab ? "active" : ""}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>
                            {result.original && (
                                <button onClick={generatePDF} className="dys-action-badge pdf">📄 PDF</button>
                            )}
                        </div>

                        <div className="dys-text-box">
                            {loading ? (
                                <p style={{ opacity: 0.6 }}>⏳ Processing content...</p>
                            ) : (
                                <>
                                    {activeTab === "summary" && (
                                        <div style={{ textAlign: "left" }}>
                                            {result.summary && (
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                                                    <button onClick={() => handleReadAloud(result.summary)} className="dys-action-badge listen">
                                                        {isSpeaking ? "🛑 Stop" : "🔊 Listen"}
                                                    </button>
                                                </div>
                                            )}
                                            {renderFormattedText(result.summary)}
                                        </div>
                                    )}
                                    {activeTab === "syllables" && (
                                        <div style={{ textAlign: "left" }}>
                                            {result.syllables && (
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                                                    <button onClick={() => handleReadAloud(result.syllables)} className="dys-action-badge listen">
                                                        {isSpeaking ? "🛑 Stop" : "🔊 Read"}
                                                    </button>
                                                </div>
                                            )}
                                            <p style={{ lineHeight: "2.5" }}>{result.syllables || "No parsing data yet."}</p>
                                        </div>
                                    )}
                                    {activeTab === "mindmap" && (
                                        <pre style={{ textAlign: "center", fontSize: "0.9rem", color: "#94a3af" }}>
                                            {result.mindmap || "No flow chart yet."}
                                        </pre>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
