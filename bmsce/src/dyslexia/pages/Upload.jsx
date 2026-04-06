import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { db, auth } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useLanguage } from "@/LanguageContext";
import "./dyslexia.css";

export default function Upload() {
    const navigate = useNavigate();
    const { t, isDyslexicFont } = useLanguage();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("summary");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [user, setUser] = useState(null);
    const [result, setResult] = useState({
        original: "",
        summary: "",
        syllables: null,
        mindmap: "",
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select an audio file first.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setResult({
                original: data.original || "",
                summary: data.summary || "No summary returned.",
                syllables: data.syllables || "",
                mindmap: data.mindmap || "No flow chart returned.",
            });

            if (user) {
                await addDoc(collection(db, "records"), {
                    userId: user.uid,
                    type: "audio",
                    original: data.original || "",
                    summary: data.summary || "No summary returned.",
                    syllables: data.syllables ? (typeof data.syllables === 'string' ? data.syllables : JSON.stringify(data.syllables)) : "",
                    mindmap: data.mindmap || "No flow chart returned.",
                    createdAt: serverTimestamp()
                });
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
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
        doc.text("Dyslexia Platform - Audio Analysis Report", pageWidth / 2, 20, { align: "center" });
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
        doc.save(`Dyslexia-Upload-Report-${new Date().toLocaleDateString()}.pdf`);
    };

    const renderFormattedText = (text) => {
        if (!text) return <p style={{ opacity: 0.6 }}>{t("noDataAvailable")}</p>;
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

            <main className="dys-sub-main">
                <header className="dys-sub-header">
                    <h1 className="dys-sub-title">📁 {t("uploadMp3")}</h1>
                    
                    <div className="dys-panel" style={{ maxWidth: '600px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
                        <input 
                            type="file" 
                            accept="audio/*" 
                            onChange={handleFileChange} 
                            id="audio-upload"
                            style={{ display: "none" }}
                        />
                        <label htmlFor="audio-upload" className="font-helper-btn" style={{ fontSize: '1.1rem', padding: '20px', display: 'block', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            {file ? `🔔 ${t("selected")}: ${file.name}` : t("selectAudioFile")}
                        </label>
                        
                        {file && (
                            <button 
                                onClick={handleUpload} 
                                className="dys-btn-upload"
                                disabled={loading}
                                style={{ marginTop: '20px', opacity: loading ? 0.6 : 1 }}
                            >
                                {loading ? `⏳ ${t("transcribing")}` : `🚀 ${t("processAudio")}`}
                            </button>
                        )}
                    </div>
                </header>

                <div className="dys-layout-grid">
                    <section className="dys-panel">
                        <h3 className="dys-panel-title">📝 {t("transcriptResult")}</h3>
                        <div className="dys-text-box">
                            {result.original || <span style={{ opacity: 0.4 }}>{t("transcriptResult")}...</span>}
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
                                <p style={{ opacity: 0.6 }}>⏳ {t("analyzingAudio")}</p>
                            ) : (
                                <>
                                    {activeTab === "summary" && (
                                        <div style={{ textAlign: "left" }}>
                                            {result.summary && (
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                                                    <button onClick={() => handleReadAloud(result.summary)} className="dys-action-badge listen">
                                                        {isSpeaking ? `🛑 ${t("stop")}` : `🔊 ${t("listen")}`}
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
                                                        {isSpeaking ? `🛑 ${t("stop")}` : `🔊 ${t("read")}`}
                                                    </button>
                                                </div>
                                            )}
                                            <p style={{ lineHeight: "2.5" }}>{result.syllables || t("noParsingData")}</p>
                                        </div>
                                    )}
                                    {activeTab === "mindmap" && (
                                        <pre style={{ textAlign: "center", fontSize: "0.9rem", color: "#94a3af" }}>
                                            {result.mindmap || t("noFlowChart")}
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
