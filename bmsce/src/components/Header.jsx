import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../auth";
import { useLanguage } from "../LanguageContext";
import { languages } from "../translations";
import "./Header.css";

export default function Header({ user }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { language, changeLanguage, t } = useLanguage();

    const [isLangOpen, setIsLangOpen] = React.useState(false);
    const langRef = React.useRef(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (langRef.current && !langRef.current.contains(event.target)) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLangChange = (code) => {
        changeLanguage(code);
        setIsLangOpen(false);
    };

    const isMainDashboard = location.pathname === "/dashboard";
    const isAuthPage = location.pathname === "/auth";
    const isLandingPage = location.pathname === "/";

    if (isLandingPage || isAuthPage) return null;

    const currentLang = languages.find(l => l.code === language) || languages[0];

    return (
        <nav className="dash-nav">
            <div className="dash-nav-left" onClick={() => navigate("/dashboard")} style={{ cursor: 'pointer' }}>
                {!isMainDashboard ? (
                    <div className="dash-back-btn">
                        <svg className="dash-logo" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        <span className="dash-brand-name">{t("back") || "Back"}</span>
                    </div>
                ) : (
                    <div className="dash-brand">
                        <svg className="dash-logo" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54Z" />
                            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54Z" />
                        </svg>
                        <span className="dash-brand-name">DDAP</span>
                    </div>
                )}
            </div>

            <div className="dash-nav-right">
                <div className="dash-lang-dropdown-container" ref={langRef}>
                    <button 
                        className={`dash-lang-toggle ${isLangOpen ? 'active' : ''}`}
                        onClick={() => setIsLangOpen(!isLangOpen)}
                    >
                        <svg className="lang-globe-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span className="current-lang-code">{currentLang.nativeName.split(' ')[0]}</span>
                        <svg className={`lang-chevron ${isLangOpen ? 'up' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {isLangOpen && (
                        <div className="dash-lang-menu">
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    className={`dash-lang-option ${language === lang.code ? 'selected' : ''}`}
                                    onClick={() => handleLangChange(lang.code)}
                                >
                                    <span className="lang-native">{lang.nativeName}</span>
                                    {language === lang.code && (
                                        <svg className="lang-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dash-user-actions">
                    <button onClick={logout} className="dash-logout-btn" title={t("logout")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
