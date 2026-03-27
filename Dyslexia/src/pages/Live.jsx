import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Live() {
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
    // Use a ref to avoid stale closure inside onend
    const liveTextRef = useRef("");

    // Get current user
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const startRecording = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

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
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript + " ";
                } else {
                    interimTranscript += result[0].transcript;
                }
            }
            const fullText = finalTranscript + interimTranscript;
            console.log("Transcript:", fullText);
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

                // Auto-save to database
                try {
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
                } catch (dbErr) {
                    console.error("Firestore save error:", dbErr);
                }
            } catch (err) {
                console.error("Backend error:", err);
                setResult((prev) => ({
                    ...prev,
                    summary: "❌ Could not connect to backend.",
                    mindmap: "❌ Could not connect to backend.",
                }));
            } finally {
                setLoading(false);
            }
        };
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

        // For syllables, we might want to remove hyphens for smoother reading
        const textToRead = text.replace(/-/g, ' ');
        
        const utterance = new window.SpeechSynthesisUtterance(textToRead);
        utterance.rate = 0.9; // Slightly slower for better clarity
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

        // Header
        doc.setFontSize(22);
        doc.setTextColor(59, 130, 246);
        doc.text("Dyslexia Platform - Session Report", pageWidth / 2, 20, { align: "center" });
        
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, 25, pageWidth - margin, 25);
        
        let yPos = 40;

        const addSection = (title, content) => {
            if (!content) return;
            
            // Check for page overflow
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

        doc.save(`Dyslexia-Report-${new Date().toLocaleDateString()}.pdf`);
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const tabs = ["summary", "syllables", "mindmap"];

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>🎙 LIVE TRANSCRIPTION</h1>

            {/* RECORD / STOP BUTTON */}
            <div style={styles.recordWrapper}>
                {!isRecording ? (
                    <button style={styles.recordBtn} onClick={startRecording}>
                        ⏺ Click here to Record
                    </button>
                ) : (
                    <button style={{ ...styles.recordBtn, background: "#7f1d1d", animation: "pulse 1.2s infinite" }} onClick={stopRecording}>
                        ⏹ Stop Recording
                    </button>
                )}
                {isRecording && (
                    <p style={styles.listeningLabel}>🔴 Listening...</p>
                )}
            </div>

            <div style={styles.layout}>
                {/* LEFT — Live Transcript */}
                <div style={styles.panel}>
                    <h3 style={styles.panelTitle}>📝 Live Transcript</h3>
                    <div style={styles.box}>
                        {liveText || <span style={{ color: "#475569" }}>Start speaking...</span>}
                    </div>
                </div>

                {/* RIGHT — Tabs */}
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
                            <button 
                                onClick={generatePDF}
                                style={styles.downloadBtn}
                                title="Download as PDF"
                            >
                                📥 PDF
                            </button>
                        )}
                    </div>

                    <div style={styles.box}>
                        {loading ? (
                            <p style={{ color: "#94a3b8" }}>⏳ Processing...</p>
                        ) : (
                            <>
                                {activeTab === "summary" && (
                                    <div style={{ textAlign: "left" }}>
                                        {result.summary && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                                                <button 
                                                    onClick={() => handleReadAloud(result.summary)}
                                                    style={styles.ttsBtn}
                                                >
                                                    {isSpeaking ? "🛑 Stop" : "🔊 Listen"}
                                                </button>
                                            </div>
                                        )}
                                        <div style={{ color: "#cbd5e1", fontSize: "16px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                                            {result.summary || <span style={{ color: "#475569" }}>No summary yet. Record something first.</span>}
                                        </div>
                                    </div>
                                )}
                                {activeTab === "syllables" && (
                                    <div style={{ textAlign: "left" }}>
                                        {result.syllables && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                                                <button 
                                                    onClick={() => handleReadAloud(result.syllables)}
                                                    style={styles.ttsBtn}
                                                >
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
                                            <pre style={{ 
                                                whiteSpace: "pre-wrap", 
                                                wordBreak: "break-word", 
                                                fontSize: "15px", 
                                                lineHeight: "1.6",
                                                color: "#e2e8f0",
                                                fontFamily: "'Courier New', Courier, monospace",
                                                textAlign: "center"
                                            }}>
                                                {result.mindmap}
                                            </pre>
                                        ) : (
                                            <p style={{ color: "#475569", padding: "40px" }}>
                                                No flow chart yet. Record something first.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
            `}</style>
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
    recordWrapper: {
        margin: "20px 0",
    },
    recordBtn: {
        background: "#ef4444",
        border: "none",
        padding: "15px 35px",
        borderRadius: "12px",
        color: "white",
        fontSize: "18px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    },
    listeningLabel: {
        marginTop: "8px",
        color: "#f87171",
        fontSize: "14px",
    },
    layout: {
        display: "flex",
        justifyContent: "center",
        gap: "30px",
        marginTop: "40px",
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
    imageHeader: {
        marginBottom: "10px",
        padding: "4px 12px",
        background: "#0f172a",
        borderRadius: "6px",
        display: "inline-block",
        border: "1px solid #1e293b",
    },
    smallActionBtn: {
        background: "rgba(59, 130, 246, 0.1)",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        color: "#3b82f6",
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    box: {
        background: "#0f172a",
        borderRadius: "12px",
        padding: "16px",
        minHeight: "200px",
        fontSize: "14px",
        lineHeight: "1.7",
        overflowY: "auto",
        maxHeight: "400px",
    },
    ttsBtn: {
        background: "rgba(59, 130, 246, 0.15)",
        border: "1px solid rgba(59, 130, 246, 0.4)",
        color: "#60a5fa",
        padding: "6px 14px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },
    downloadBtn: {
        background: "rgba(16, 185, 129, 0.15)",
        border: "1px solid rgba(16, 185, 129, 0.4)",
        color: "#10b981",
        padding: "8px 16px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
        marginLeft: "10px",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "4px",
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
        transition: "all 0.2s",
    },
    tabBtnActive: {
        background: "#3b82f6",
        color: "white",
        border: "1px solid #3b82f6",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "13px",
    },
    th: {
        textAlign: "left",
        padding: "6px 10px",
        borderBottom: "1px solid #1e293b",
        color: "#94a3b8",
    },
    td: {
        padding: "5px 10px",
        borderBottom: "1px solid #1e293b",
        color: "#e2e8f0",
    },
    syllablePill: {
        display: "inline-block",
        background: "#1e293b",
        padding: "6px 10px",
        borderRadius: "8px",
        marginRight: "6px",
        marginBottom: "8px",
        color: "#f8fafc",
        fontWeight: "500",
        textAlign: "center"
    }
};