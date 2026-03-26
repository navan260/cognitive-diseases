import { logout } from "./auth";

export default function Hero({ user }) {
    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>🎉 Welcome {user.email}</h1>

            <button onClick={logout}>Logout</button>
        </div>
    );
}