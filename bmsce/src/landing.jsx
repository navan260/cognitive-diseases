import PixelSnow from './PixelSnow';
import './landing.css';
import { useLanguage } from './LanguageContext';
import { getTranslation, languages } from './translations';

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

export default function Landing({ goToAuth }) {
    const { language, changeLanguage } = useLanguage();
    const t = (key) => getTranslation(language, key);
    
    return (
        <>
            {/* ── Full-screen snow background (fixed) ── */}
            <div className="snow-background">
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

            <div className="landing-page">
                {/* ── Language Selector (Top Left) ── */}
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

                {/* ── Navigation ── */}
                <header className="landing-header">
                    <h1>{t("ddap")}</h1>
                    <button id="login-btn" className="login-button" onClick={goToAuth}>
                        {t("login")}
                    </button>
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
                                <a href="https://github.com/Tanish-2112" target="_blank" rel="noreferrer" id="github-link">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg"
                                        alt="GitHub"
                                    />
                                </a>
                                <a href="https://www.instagram.com/_heyy_sxmarth/#" target="_blank" rel="noreferrer" id="instagram-link">
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