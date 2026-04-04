import { useNavigate } from "react-router-dom";
import { logout } from "./auth";
import "./hero.css";
import { useLanguage } from "./LanguageContext";
import { getTranslation, languages } from "./translations";

export default function Hero({ user }) {
    const navigate = useNavigate();
    const { language, changeLanguage } = useLanguage();
    const t = (key) => getTranslation(language, key);
    
    const userDisplayName = user?.displayName || user?.email?.split('@')[0] || "User";

    return (
        <div className="dashboard-wrapper">
            <div className="snow-background"></div>

            {/* Dashboard Navbar */}
            <nav className="dash-nav">
                <div className="dash-nav-left">
                    <div className="dash-brand">
                        <svg className="dash-logo" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54Z" />
                            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54Z" />
                        </svg>
                        <span className="dash-brand-name">DDAP</span>
                    </div>
                </div>

                <div className="dash-nav-right">
                    <div className="dash-user-badge">
                        <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span className="user-email">{user?.email}</span>
                        <div className="user-divider"></div>
                        <button onClick={logout} className="dash-logout-link">{t("logout")}</button>
                    </div>
                </div>
            </nav>

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
                </div>
            </div>
        </div>
    );
}
