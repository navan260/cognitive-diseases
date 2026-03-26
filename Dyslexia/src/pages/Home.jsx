import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>🧠 DYSLEXIA MODE</h1>

            <button onClick={() => navigate("/live")}>
                🎤 Live Transcription
            </button>

            <button style={{ marginLeft: "20px" }}>
                📁 Upload MP3
            </button>

            <div style={{ marginTop: "40px" }}>
                <h3>📚 Previous Records</h3>
                <p>No data yet...</p>
            </div>
        </div>
    );
}