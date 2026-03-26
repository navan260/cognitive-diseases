import { logout } from "./auth";

export default function Hero({ user }) {
    return (
<div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
    <h1>🎉 Welcome {user.email}</h1>
    <p>Select an assessment below to begin:</p>

    <div style={{ margin: "40px 0" }}>
        <a href="http://localhost:5175/" style={{ textDecoration: "none" }}>
            <button style={{ 
                padding: "16px 32px",
                fontSize: "1.2rem",
                fontWeight: "bold",
                background: "#7f10da",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(127,16,218,0.3)"
            }}>
                Start Dyscalculia Assessment
            </button>
        </a>
    </div>

    {/* Dyslexia button */}
    <button
        onClick={() => window.location.href = "http://localhost:5174"}
        style={{ marginBottom: "20px", padding: "10px 20px", borderRadius: "8px" }}
    >
        Go to Dyslexia Mode
    </button>

    <br />

    <button 
        onClick={logout}
        style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #ccc", background: "transparent", cursor: "pointer" }}
    >
        Logout
    </button>
</div>
    );
}