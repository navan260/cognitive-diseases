import { useNavigate } from "react-router-dom";
import "./hero.css";
import { useLanguage } from "./LanguageContext";
import { getTranslation } from "./translations";

export default function Hero({ user }) {
    const navigate = useNavigate();
    const { language, changeLanguage } = useLanguage();
    const t = (key) => getTranslation(language, key);
    
    const userDisplayName = user?.displayName || user?.email?.split('@')[0] || "User";

    return (
        <div className="dashboard-wrapper">
            <div className="snow-background"></div>

            <div className="dashboard-main">
                <header className="dash-header">
                    <h1 className="dash-welcome-title">{t("welcomeBack")}</h1>
                    <p className="dash-welcome-subtitle">{t("whatToDo")}</p>
                </header>

                <div className="dash-grid">
                    {/* Dyscalculia Card */}
                    <div className="dash-mode-card">
                        <div className="mode-icon-container dyscalculia-glow">
                            <svg className="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                                <text x="5" y="8" fontSize="4" fill="currentColor" stroke="none" fontWeight="bold">1</text>
                                <text x="16" y="8" fontSize="4" fill="currentColor" stroke="none" fontWeight="bold">2</text>
                                <text x="5" y="19" fontSize="4" fill="currentColor" stroke="none" fontWeight="bold">3</text>
                                <text x="16" y="19" fontSize="4" fill="currentColor" stroke="none" fontWeight="bold">4</text>
                            </svg>
                        </div>
                        <h2 className="mode-name">{t("dyscalculia")}</h2>
                        <p className="mode-desc">{t("dyscalculiaDesc")}</p>
                        <button 
                            onClick={() => navigate("/dycalculia")} 
                            className="mode-btn btn-dyscalculia"
                        >
                            {t("startDyscalculia")}
                        </button>
                    </div>

                    {/* Dyslexia Card */}
                    <div className="dash-mode-card">
                        <div className="mode-icon-container dyslexia-glow">
                            <svg className="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                <path d="M12 6l-1 2 2-1-1 2" fill="currentColor" stroke="none" transform="translate(-3, -2) scale(0.8)"/>
                                <text x="10" y="10" fontSize="5" fill="currentColor" stroke="none" fontWeight="bold">A</text>
                                <text x="15" y="7" fontSize="4" fill="currentColor" stroke="none" fontWeight="bold">B</text>
                                <text x="13" y="15" fontSize="4" fill="currentColor" stroke="none" fontWeight="bold">C</text>
                            </svg>
                        </div>
                        <h2 className="mode-name">{t("dyslexia")}</h2>
                        <p className="mode-desc">{t("dyslexiaDesc")}</p>
                        <button 
                            onClick={() => navigate("/dyslexia")} 
                            className="mode-btn btn-dyslexia"
                        >
                            {t("startDyslexia")}
                        </button>
                    </div>

                    {/* Prosopagnosia Card */}
                    <div className="dash-mode-card">
                        <div className="mode-icon-container dyslexia-glow">
                            <svg className="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="8" r="5" />
                                <path d="M20 21a8 8 0 0 0-16 0" />
                                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                            </svg>
                        </div>
                        <h2 className="mode-name">Prosopagnosia</h2>
                        <p className="mode-desc">Face recognition and memory assistance tools to help identify individuals.</p>
                        <button 
                            onClick={() => navigate("/propognasia")} 
                            className="mode-btn btn-dyslexia"
                        >
                            Start Prosopagnosia
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
