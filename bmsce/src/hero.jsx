import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "./auth";
import PixelSnow from "./PixelSnow";
import "./auth.css";
import { useLanguage } from "./LanguageContext";
import { getTranslation, languages } from "./translations";

export default function Hero({ user }) {
    const navigate = useNavigate();
    const { language, changeLanguage } = useLanguage();
    const t = (key) => getTranslation(language, key);
    const [selected, setSelected] = useState(0);
    
    // Assessments array updates when language changes
    const assessments = [
        {
            name: t("dyscalculia"),
            url: "/dycalculia",
            description: t("dyscalculiaDesc"),
            type: "Assessment"
        },
        {
            name: t("dyslexia"),
            url: "/dyslexia",
            description: t("dyslexiaDesc"),
            type: "Mode"
        },
    ];

    const currentAssessment = assessments[selected];

    return (
        <>
            {/* Same PixelSnow effect */}
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
                {/* Language Selector (Top Left) */}
                <div style={styles.languageSelector}>
                    <select 
                        value={language} 
                        onChange={(e) => changeLanguage(e.target.value)}
                        style={styles.languageDropdown}
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>
                                {lang.nativeName}
                            </option>
                        ))}
                    </select>
                </div>

                <div
                    className="auth-card"
                    style={{
                        zIndex: 1,
                        padding: "50px 40px",
                        maxWidth: "750px",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center"
                    }}
                >

                    <h1 className="auth-title" style={{ marginBottom: "15px" }}>
                         {t("login")} {user?.email || "User"}
                    </h1>

                    <p className="auth-subtitle" style={{ marginBottom: "35px" }}>
                        {t("exploreDisorders")}
                    </p>

                    {/* Selection tabs using auth-tab classes */}
                    <div
                        className="auth-tabs"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "8px",
                            width: "100%",
                            padding: "8px",
                            marginBottom: "40px"
                        }}
                    >
                        {assessments.map((assessment, index) => (
                            <button
                                key={assessment.name}
                                onClick={() => setSelected(index)}
                                className={`auth-tab ${selected === index ? "active" : ""}`}
                                style={{
                                    padding: "16px",
                                    fontSize: "1rem",
                                    flex: 1
                                }}
                            >
                                {assessment.name}
                            </button>
                        ))}
                    </div>

                    {/* Selected content */}
                    <div style={{
                        border: `1px solid rgba(95, 148, 255, 0.25)`,
                        borderRadius: "18px",
                        padding: "36px",
                        marginBottom: "40px",
                        background: "rgba(5, 13, 30, 0.45)",
                        width: "100%"
                    }}>
                        <h2 style={{ color: "#d1e9ff", marginBottom: "14px", fontSize: "1.5rem", fontWeight: "700" }}>
                            {currentAssessment.name} {t("assessment")}
                        </h2>
                        <p style={{ color: "#93b8e0", marginBottom: "32px", fontSize: "1.05rem", lineHeight: "1.6" }}>
                            {currentAssessment.description}
                        </p>

                        <button
                            onClick={() => navigate(currentAssessment.url)}
                            className="auth-btn-primary"
                            style={{
                                padding: "18px 36px",
                                fontSize: "1.1rem",
                                width: "auto",
                                minWidth: "250px"
                            }}
                        >
                            {t("start")} {currentAssessment.name} {t("assessment")}
                        </button>
                    </div>

                    {/* Logout button using the ghost/link styling */}
                    <button
                        onClick={logout}
                        className="auth-link"
                        style={{
                            padding: "10px",
                            fontSize: "0.95rem"
                        }}
                    >
                        ← {t("logout")}
                    </button>
                </div>
            </div>
        </>
    );
}

const styles = {
    languageSelector: {
        position: "fixed",
        top: 20,
        left: 20,
        zIndex: 100,
    },
    languageDropdown: {
        background: "rgba(30, 41, 59, 0.9)",
        border: "1px solid rgba(96, 165, 250, 0.3)",
        color: "#cbd5e1",
        padding: "8px 12px",
        borderRadius: "8px",
        fontSize: "14px",
        fontFamily: "inherit",
        cursor: "pointer",
        backdropFilter: "blur(8px)",
    },
};
