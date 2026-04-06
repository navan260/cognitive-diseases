import './landing.css';
import { useLanguage } from './LanguageContext';
import { getTranslation, languages } from './translations';
import { useNavigate } from 'react-router-dom';
import { Brain, User } from 'lucide-react';

const dyslexiaImages = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_3wys4e1z3zHSjP0Zfs0Oik-lJycvN5HZzA&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR7QOTYA4fuhtXSNFCCwxnShjWnCzxhBmiHw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSjGcpaXg7saJP-TfiZ52e9iiZY5tnNxFeLg&s',
    'https://cdn.sanity.io/images/68lp9qid/production/cc0eaf9999c60ae95448087534dd9e9eda663d93-1200x750.jpg/27-june-2022-Dyslexia-editoriall.jpg?rect=37,0,1127,750&w=320&h=213&fit=min&auto=format',
];

const dyscalculiaImages = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR10hoJTeDUqSjj58gbM6olS3mllTg_AsLRpg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROKBN3Q9aMQ7ZvgyMz7_TMNsbfKh5yYiTi0w&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUNU4oVMwhoyTqFiRe0Pw2VgkEq4aD7gWVdA&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzcRrFpcMS3vTTt6mKheN34wcgZCG18os2fg&s',
];



function ImageGallery({ images }) {
    // Duplicate for seamless infinite scroll
    const doubled = [...images, ...images];
    return (
        <div className="image-gallery">
            <div className="image-gallery-track">
                {doubled.map((src, i) => (
                    <img key={i} src={src} alt="" loading="lazy" />
                ))}
            </div>
        </div>
    );
}

export default function Landing({ user }) {
    const { language, changeLanguage } = useLanguage();
    const t = (key) => getTranslation(language, key);
    const navigate = useNavigate();

    const getUserName = () => {
        if (!user) return "";
        if (user.displayName) return user.displayName;
        return user.email?.split("@")[0] || "User";
    };

    return (
        <>
            {/* ── Background (Premium Radial Gradient) ── */}
            <div className="snow-background"></div>

            <div className="landing-page">

                {/* ── Navigation ── */}
                <header className="landing-header">
                    <div className="nav-logo" onClick={() => navigate('/')}>
                        <Brain className="nav-logo-icon" size={28} color="#2563eb" strokeWidth={2.5} />
                        <span className="nav-logo-text">{t("ddap")}</span>
                    </div>

                    <div className="nav-actions">
                        <div className="nav-lang-picker">
                            <select
                                value={language}
                                onChange={(e) => changeLanguage(e.target.value)}
                                className="nav-lang-select"
                            >
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.nativeName.split(' ')[0]} {/* Show short name if needed, or just lang.nativeName */}
                                    </option>
                                ))}
                            </select>
                        </div>


                        {user ? (
                            <div className="user-profile-badge" onClick={() => navigate('/dashboard')}>
                                <span className="user-name">{getUserName()}</span>
                                <div className="user-avatar">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="User" />
                                    ) : (
                                        <span className="avatar-placeholder">
                                            <User size={20} color="currentColor" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (

                            <div className="guest-actions">
                                <button className="nav-get-started" onClick={() => navigate('/auth')}>
                                    {t("getStarted")}
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* ── Hero Section ── */}
                <section className="hero-section">
                    <h2>{t("heroCognitiveDiseases")}<br />{t("heroAwareness")}</h2>
                    <p>
                        {t("heroDescription")}
                    </p>
                    <span className="scroll-hint">{t("scrollExplore")}</span>
                </section>

                {/* ── Content Sections ── */}
                <main className="landing-content">
                    <div className="content-wrapper">

                        {/* Overview */}
                        <section className="content-section">
                            <h2>{t("overviewTitle")}</h2>
                            <p>
                                {t("overviewText")}
                            </p>
                        </section>

                        {/* Problem Statement */}
                        <section className="content-section">
                            <h2>{t("problemTitle")}</h2>
                            <p>
                                {t("problemText")}
                            </p>
                        </section>

                        {/* Dyslexia */}
                        <section className="content-section">
                            <h2>{t("dyslexiaTitle")}</h2>
                            <p>
                                {t("dyslexiaText")}
                            </p>
                            <ImageGallery images={dyslexiaImages} />
                        </section>

                        {/* Dyscalculia */}
                        <section className="content-section">
                            <h2>{t("dyscalculiaTitle")}</h2>
                            <p>
                                {t("dyscalculiaText")}
                            </p>
                            <ImageGallery images={dyscalculiaImages} />
                        </section>



                        {/* Footer */}
                        <footer className="footer-section">
                            <h3>{t("connectUs")}</h3>
                            <div className="social-links">
                                <a href="https://github.com/Kiran8112006" target="_blank" rel="noreferrer" id="github-link">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg"
                                        alt="GitHub"
                                    />
                                </a>
                                <a href="https://www.instagram.com/kiran._8/" target="_blank" rel="noreferrer" id="instagram-link">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/CIS-A2K_Instagram_Icon_%28Black%29.svg/960px-CIS-A2K_Instagram_Icon_%28Black%29.svg.png"
                                        alt="Instagram"
                                    />
                                </a>
                            </div>
                        </footer>

                    </div>
                </main>
            </div>
        </>
    );
}