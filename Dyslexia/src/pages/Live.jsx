import { useState, useRef } from "react";

export default function Live() {
    const [isRecording, setIsRecording] = useState(false);
    const [liveText, setLiveText] = useState("");
    const [activeTab, setActiveTab] = useState("summary");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState({
        original: "",
        summary: "",
        syllables: null,
        mindmap: "",
    });

    const recognitionRef = useRef(null);
    // Use a ref to avoid stale closure inside onend
    const liveTextRef = useRef("");

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
                                {tab === "mindmap" && "🗺 Mind Map"}
                            </button>
                        ))}
                    </div>

                    <div style={styles.box}>
                        {loading ? (
                            <p style={{ color: "#94a3b8" }}>⏳ Processing...</p>
                        ) : (
                            <>
                                {activeTab === "summary" && (
                                    <p style={{ whiteSpace: "pre-wrap", lineHeight: "2" }}>
                                        {result.summary || <span style={{ color: "#475569" }}>No summary yet. Record something first.</span>}
                                    </p>
                                )}
                                {activeTab === "syllables" && (
                                    <p style={{ whiteSpace: "pre-wrap", lineHeight: "2", fontSize: "16px" }}>
                                        {result.syllables || <span style={{ color: "#475569" }}>No data yet.</span>}
                                    </p>
                                )}
                                {activeTab === "mindmap" && (
                                    <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
                                        {result.mindmap || <span style={{ color: "#475569" }}>No mind map yet. Record something first.</span>}
                                    </p>
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
        background: "#020617",
        color: "white",
        minHeight: "100vh",
        padding: "30px 20px",
        textAlign: "center",
        fontFamily: "'Segoe UI', sans-serif",
    },
    heading: {
        fontSize: "28px",
        fontWeight: 700,
        marginBottom: "10px",
        letterSpacing: "2px",
    },
    recordWrapper: {
        margin: "20px 0",
    },
    recordBtn: {
        background: "#ef4444",
        border: "none",
        padding: "14px 30px",
        borderRadius: "50px",
        color: "white",
        fontSize: "16px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.3s",
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
        background: "#0f172a",
        borderRadius: "12px",
        padding: "16px",
        minHeight: "200px",
        fontSize: "14px",
        lineHeight: "1.7",
        overflowY: "auto",
        maxHeight: "400px",
    },
    tabs: {
        display: "flex",
        gap: "8px",
        marginBottom: "10px",
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