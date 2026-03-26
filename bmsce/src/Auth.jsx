import { useState } from "react";
import { signup, login } from "./auth";
import { auth } from "./firebase";
import {
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";
import "./auth.css";
import PixelSnow from "./PixelSnow";

const googleProvider = new GoogleAuthProvider();

export default function Auth() {
    const [tab, setTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const clear = () => { setError(""); setSuccess(""); };
    const go = (t) => { setTab(t); clear(); };
    const isReset = tab === "reset";

    const handleSubmit = async (e) => {
        e.preventDefault();
        clear();
        try {
            if (tab === "signup") await signup(email, password);
            else if (tab === "login") await login(email, password);
            else {
                await sendPasswordResetEmail(auth, email);
                setSuccess("✅ Reset link sent — check your inbox.");
            }
        } catch (err) {
            setError(err.message || "Something went wrong. Try again.");
        }
    };

    const handleGoogle = async () => {
        clear();
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            if (err.code !== "auth/popup-closed-by-user") {
                setError(err.message || "Google sign-in failed.");
            }
        }
    };

    return (
        <>
            <div className="snow-background" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                <PixelSnow
                    color="#a8d0ff"
                    flakeSize={0.01}
                    minFlakeSize={1.25}
                    pixelResolution={200}
                    speed={1.25}
                    density={0.3}
                    direction={125}
                    brightness={1}
                    depthFade={8}
                    farPlane={20}
                    gamma={0.4545}
                    variant="square"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            <div className="auth-page">
                <div className="auth-card">

                <div className="auth-brand">
                    <div className="auth-logo"><img src="https://static.vecteezy.com/system/resources/thumbnails/033/539/545/small/functioning-of-the-human-body-and-the-brain-transparent-background-png.png" style={{ width: "135px", height: "135px" }} alt="cognitive" /></div>
                    <h1 className="auth-title">DDAP</h1>
                    <p className="auth-subtitle">
                        {isReset ? "Reset your password" : "Cognitive Health Platform"}
                    </p>
                </div>

                {!isReset && (
                    <div className="auth-tabs" role="tablist">
                        <button
                            id="tab-login"
                            role="tab"
                            className={`auth-tab${tab === "login" ? " active" : ""}`}
                            onClick={() => go("login")}
                        >Login</button>
                        <button
                            id="tab-signup"
                            role="tab"
                            className={`auth-tab${tab === "signup" ? " active" : ""}`}
                            onClick={() => go("signup")}
                        >Sign Up</button>
                    </div>
                )}

                {isReset && (
                    <button className="auth-back-btn" onClick={() => go("login")}>
                        ← Back to Login
                    </button>
                )}

                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="auth-email">Email</label>
                        <input
                            id="auth-email"
                            className="auth-input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    {!isReset && (
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="auth-password">Password</label>
                            <input
                                id="auth-password"
                                className="auth-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete={tab === "signup" ? "new-password" : "current-password"}
                            />
                        </div>
                    )}

                    {tab === "login" && (
                        <div className="auth-forgot-row">
                            <button
                                id="btn-forgot"
                                type="button"
                                className="auth-link"
                                onClick={() => go("reset")}
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    <button id="auth-submit" type="submit" className="auth-btn-primary">
                        {tab === "signup" ? "Create Account"
                            : tab === "reset" ? "Send Reset Link"
                                : "Sign In"}
                    </button>
                </form>
                {!isReset && (
                    <>
                        <div className="auth-divider">
                            <span>or continue with</span>
                        </div>

                        <button
                            id="btn-google"
                            type="button"
                            className="auth-btn-google"
                            onClick={handleGoogle}
                        >
                            <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Continue with Google</span>
                        </button>
                    </>
                )}

                {!isReset && (
                    <p className="auth-footer">
                        {tab === "login"
                            ? <>Don&apos;t have an account?{" "}
                                <button className="auth-link" onClick={() => go("signup")}>Sign up free</button></>
                            : <>Already have an account?{" "}
                                <button className="auth-link" onClick={() => go("login")}>Sign in</button></>
                        }
                    </p>
                )}
            </div>
        </div>
        </>
    );
}