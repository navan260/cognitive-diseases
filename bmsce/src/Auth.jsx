import { useState, useEffect } from "react";
import { signup, login } from "./auth";
import { auth } from "./firebase";
import {
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";
import "./auth.css";

const googleProvider = new GoogleAuthProvider();

export default function Auth() {
    const [tab, setTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [requirements, setRequirements] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    useEffect(() => {
        if (tab === "signup") {
            setRequirements({
                length: password.length >= 8,
                upper: /[A-Z]/.test(password),
                lower: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
            });
        }
    }, [password, tab]);

    const allRequirementsMet = Object.values(requirements).every(Boolean);
    const passwordsMatch = password === confirmPassword;
    const isSignupValid = allRequirementsMet && passwordsMatch && email;

    const clear = () => { 
        setError(""); 
        setSuccess(""); 
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    };

    const go = (t) => { setTab(t); clear(); };
    const isReset = tab === "reset";

    const getFriendlyMessage = (error) => {
        const code = error.code || error.message;
        if (!code) return "An unexpected error occurred. Please try again.";

        if (code.includes('auth/email-already-in-use')) return "This email is already registered. Try logging in.";
        if (code.includes('auth/invalid-email')) return "Please enter a valid email address.";
        if (code.includes('auth/weak-password')) return "Password is too weak. Please use a stronger one.";
        if (code.includes('auth/user-not-found')) return "No account found with this email.";
        if (code.includes('auth/wrong-password')) return "Incorrect password. Please try again.";
        if (code.includes('auth/too-many-requests')) return "Too many failed attempts. Please try again later.";
        if (code.includes('auth/popup-closed-by-user')) return null; // Ignore this one

        return "Something went wrong. Please try again.";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        setSuccess("");
        try {
            if (tab === "signup") {
                if (!isSignupValid) return;
                await signup(email, password);
            }
            else if (tab === "login") await login(email, password);
            else {
                await sendPasswordResetEmail(auth, email);
                setSuccess("✅ Reset link sent — check your inbox.");
            }
        } catch (err) {
            const msg = getFriendlyMessage(err);
            if (msg) setError(msg);
        }
    };

    const handleGoogle = async () => {
        setError("");
        setSuccess("");
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error("Google Sign-In Error:", err);
            const msg = getFriendlyMessage(err);
            if (msg) setError(msg);
        }
    };

    const RequirementItem = ({ met, label }) => (
        <div className={`requirement-item ${met ? 'met' : ''}`}>
            <span className="requirement-icon">{met ? '✓' : '×'}</span>
            <span className="requirement-text">{label}</span>
        </div>
    );

    return (
        <>
            <div className="snow-background"></div>
            <div className="auth-page">
                <div className="auth-card">

                <div className="auth-brand">
                    <div className="brand-header">
                        <svg className="nav-logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54Z" />
                            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54Z" />
                        </svg>
                        <span className="brand-name">DDAP</span>
                    </div>
                    <h2 className="auth-heading">
                        {tab === "login" ? "Welcome Back" : tab === "signup" ? "Create Your Account" : "Reset Password"}
                    </h2>
                    <p className="auth-description">
                        {isReset ? "Instructions will be sent to your email" : "Join us and start your story"}
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

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="auth-password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="auth-password"
                                className="auth-input pr-10"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete={tab === "signup" ? "new-password" : "current-password"}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {tab === "signup" && (
                        <>
                            <div className="password-requirements">
                                <p className="requirements-title">Password must meet all requirements:</p>
                                <RequirementItem met={requirements.length} label="At least 8 characters long" />
                                <RequirementItem met={requirements.upper} label="At least one uppercase letter" />
                                <RequirementItem met={requirements.lower} label="At least one lowercase letter" />
                                <RequirementItem met={requirements.number} label="At least one number" />
                                <RequirementItem met={requirements.special} label="At least one special character" />
                            </div>

                            <div className="auth-field">
                                <label className="auth-label" htmlFor="auth-confirm">Confirm Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        id="auth-confirm"
                                        className="auth-input pr-10"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {confirmPassword && !passwordsMatch && (
                                    <span className="field-error">Passwords do not match</span>
                                )}
                            </div>
                        </>
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

                    <button 
                        id="auth-submit" 
                        type="submit" 
                        className="auth-btn-primary"
                        disabled={tab === "signup" && !isSignupValid}
                    >
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
