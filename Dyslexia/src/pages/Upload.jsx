import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Upload() {
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

    // Get current user
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
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
            const res = await fetch("http://127.0.0.1:5000/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Upload failed");
            }

            const data = await res.json();
            setResult({
                original: data.original || "",
                summary: data.summary || "No summary returned.",
                syllables: data.syllables || "",
                mindmap: data.mindmap || "No flow chart returned.",
            });

            // Auto-save to database
            try {
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
            } catch (dbErr) {
                console.error("Firestore save error:", dbErr);
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert(`Error: ${err.message}`);
            setResult((prev) => ({
                ...prev,
                summary: `❌ Error: ${err.message}`,
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleReadAloud = (text) => {
        if (!window.speechSynthesis) {
            alert("Your browser does not support text-to-speech.");
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        if (!text) return;

        const textToRead = text.replace(/-/g, ' ');
        const utterance = new window.SpeechSynthesisUtterance(textToRead);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

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
        
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, 25, pageWidth - margin, 25);
        
        let yPos = 40;

        const addSection = (title, content) => {
            if (!content) return;
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
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

    const tabs = ["summary", "syllables", "mindmap"];

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>📁 UPLOAD AUDIO</h1>

            <div style={styles.uploadBox}>
                <input 
                    type="file" 
                    accept="audio/*" 
                    onChange={handleFileChange} 
                    id="audio-upload"
                    style={{ display: "none" }}
                />
                <label htmlFor="audio-upload" style={styles.uploadLabel}>
                    {file ? `🔔 Selected: ${file.name}` : "📂 Click to select an audio file (MP3, WAV, etc.)"}
                </label>
                
                {file && (
                    <button 
                        onClick={handleUpload} 
                        style={styles.processBtn}
                        disabled={loading}
                    >
                        {loading ? "⏳ Transcribing..." : "🚀 Process Audio"}
                    </button>
                )}
            </div>

            <div style={styles.layout}>
                <div style={styles.panel}>
                    <h3 style={styles.panelTitle}>📝 Transcript Result</h3>
                    <div style={styles.box}>
                        {result.original || <span style={{ color: "#475569" }}>Transcript will appear here...</span>}
                    </div>
                </div>

                <div style={styles.panel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={styles.tabs}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        ...styles.tabBtn,
                                        ...(activeTab === tab ? styles.tabBtnActive : {}),
                                    }}
                                >
                                    {tab === "summary" && "📄 Summary"}
                                    {tab === "syllables" && "🔤 Syllable"}
                                    {tab === "mindmap" && "📊 Flow Chart"}
                                </button>
                            ))}
                        </div>
                        {result.original && (
                            <button onClick={generatePDF} style={styles.downloadBtn}>📥 PDF</button>
                        )}
                    </div>

                    <div style={styles.box}>
                        {loading ? (
                            <p style={{ color: "#94a3b8" }}>⏳ Analyzing audio content...</p>
                        ) : (
                            <>
                                {activeTab === "summary" && (
                                    <div style={{ textAlign: "left" }}>
                                        {result.summary && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                                                <button onClick={() => handleReadAloud(result.summary)} style={styles.ttsBtn}>
                                                    {isSpeaking ? "🛑 Stop" : "🔊 Listen"}
                                                </button>
                                            </div>
                                        )}
                                        <div style={{ color: "#cbd5e1", fontSize: "16px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                                            {result.summary || <span style={{ color: "#475569" }}>No summary yet.</span>}
                                        </div>
                                    </div>
                                )}
                                {activeTab === "syllables" && (
                                    <div style={{ textAlign: "left" }}>
                                        {result.syllables && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                                                <button onClick={() => handleReadAloud(result.syllables)} style={styles.ttsBtn}>
                                                    {isSpeaking ? "🛑 Stop" : "🔊 Read Syllables"}
                                                </button>
                                            </div>
                                        )}
                                        <p style={{ whiteSpace: "pre-wrap", lineHeight: "2", fontSize: "16px", color: "#94a3b8" }}>
                                            {result.syllables || <span style={{ color: "#475569" }}>No data yet.</span>}
                                        </p>
                                    </div>
                                )}
                                {activeTab === "mindmap" && (
                                    <div style={{ textAlign: "center", paddingTop: "10px" }}>
                                        {result.mindmap ? (
                                            <pre style={styles.pre}>
                                                {result.mindmap}
                                            </pre>
                                        ) : (
                                            <p style={{ color: "#475569", padding: "40px" }}>No flow chart yet.</p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "transparent",
        color: "white",
        minHeight: "100vh",
        padding: "30px 20px",
        textAlign: "center",
        fontFamily: "'Segoe UI', sans-serif",
    },
    heading: {
        fontSize: "28px",
        fontWeight: 700,
        marginBottom: "20px",
        letterSpacing: "2px",
    },
    uploadBox: {
        maxWidth: "600px",
        margin: "0 auto 30px auto",
        padding: "40px",
        border: "2px dashed rgba(30, 41, 59, 0.5)",
        borderRadius: "16px",
        background: "rgba(15, 23, 42, 0.7)",
        transition: "all 0.3s ease",
        backdropFilter: "blur(10px)",
    },
    uploadLabel: {
        display: "block",
        cursor: "pointer",
        color: "#94a3b8",
        fontSize: "18px",
        marginBottom: "20px",
    },
    processBtn: {
        background: "#3b82f6",
        color: "white",
        border: "none",
        padding: "12px 30px",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    layout: {
        display: "flex",
        justifyContent: "center",
        gap: "30px",
        marginTop: "30px",
        flexWrap: "wrap",
    },
    panel: {
        width: "420px",
        textAlign: "left",
    },
    panelTitle: {
        marginBottom: "8px",
        fontSize: "16px",
        color: "#94a3b8",
    },
    box: {
        background: "rgba(15, 23, 42, 0.7)",
        borderRadius: "12px",
        padding: "16px",
        minHeight: "250px",
        fontSize: "14px",
        lineHeight: "1.7",
        overflowY: "auto",
        maxHeight: "500px",
        border: "1px solid rgba(30, 41, 59, 0.5)",
        backdropFilter: "blur(10px)",
    },
    tabs: {
        display: "flex",
        gap: "8px",
        flex: 1,
    },
    tabBtn: {
        flex: 1,
        padding: "8px 0",
        border: "1px solid #1e293b",
        borderRadius: "8px",
        background: "#0f172a",
        color: "#94a3b8",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 500,
    },
    tabBtnActive: {
        background: "#3b82f6",
        color: "white",
        border: "1px solid #3b82f6",
    },
    ttsBtn: {
        background: "rgba(59, 130, 246, 0.15)",
        border: "1px solid rgba(59, 130, 246, 0.4)",
        color: "#60a5fa",
        padding: "6px 14px",
        borderRadius: "20px",
        fontSize: "12px",
        cursor: "pointer",
    },
    downloadBtn: {
        background: "rgba(16, 185, 129, 0.15)",
        border: "1px solid rgba(16, 185, 129, 0.4)",
        color: "#10b981",
        padding: "8px 16px",
        borderRadius: "8px",
        fontSize: "12px",
        cursor: "pointer",
        marginLeft: "10px",
    },
    pre: {
        whiteSpace: "pre-wrap", 
        wordBreak: "break-word", 
        fontSize: "14px", 
        lineHeight: "1.6",
        color: "#e2e8f0",
        fontFamily: "monospace",
        textAlign: "center"
    }
};
