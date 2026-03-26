import { logout } from "./auth";

export default function Hero({ user }) {
    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>👋 Welcome {user.email}</h1>

            <button onClick={logout}>Logout</button>

            <br /><br />

            {/* 👉 ADD THIS BUTTON */}
            <button
                onClick={() => window.location.href = "http://localhost:5174"}
            >
                Go to Dyslexia Mode
            </button>
        </div>
    );
}