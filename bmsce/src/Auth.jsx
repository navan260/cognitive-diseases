import { useState } from "react";
import { signup, login } from "./auth";

export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h2>Login / Signup</h2>

            <input
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <br /><br />

            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <br /><br />

            <button onClick={() => signup(email, password).catch(console.error)}>
                Sign Up
            </button>

            <button onClick={() => login(email, password).catch(console.error)}>
                Login
            </button>
        </div>
    );
}