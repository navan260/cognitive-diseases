import "./dyscalculia.css";
import { Link, useNavigate } from "react-router-dom";
import ARCountingGame from "../components/ARCountingGame";
import MusicMathGame from "../components/MusicMathGame";
import StoryMode from "../components/StoryMode";
import { useState } from "react";
import { useLanguage } from "@/LanguageContext";
import { languages } from "@/translations";

export default function Home() {
    const navigate = useNavigate();
    const { language, changeLanguage, t } = useLanguage();
    const [showARCounter, setShowARCounter] = useState(false);
    const [showMusicGame, setShowMusicGame] = useState(false);
    const [showStoryMode, setShowStoryMode] = useState(false);
    const [testsCarouselIndex, setTestsCarouselIndex] = useState(0);
    const [featuresCarouselIndex, setFeaturesCarouselIndex] = useState(0);

    if (showARCounter) return <ARCountingGame onBack={() => setShowARCounter(false)} />;
    if (showMusicGame) return <MusicMathGame onBack={() => setShowMusicGame(false)} />;
    if (showStoryMode) return <StoryMode onBack={() => setShowStoryMode(false)} />;

    const testsData = [
        { id: "dot", icon: "🔢", title: t("dotsComparison"), description: t("dotsComparisonDesc") },
        { id: "numberline", icon: "📏", title: t("numberLine"), description: t("numberLineDesc") },
        { id: "arithmetic", icon: "🧮", title: t("arithmeticTest"), description: t("arithmeticTestDesc") },
    ];

    const featuresData = [
        { icon: "📸", title: t("arObjectCounter"), description: t("arObjectCounterDesc"), action: () => setShowARCounter(true) },
        { icon: "🎵", title: t("musicMathGame"), description: t("musicMathGameDesc"), action: () => setShowMusicGame(true) },
        { icon: "📖", title: t("storyMode"), description: t("storyModeDesc"), action: () => setShowStoryMode(true) },
    ];

    return (
        <div className="dycalculia-wrapper">
            <div className="snow-background"></div>

            {/* Dashboard Navbar */}
            <nav className="dy-navbar">
                <Link to="/dashboard" className="dy-nav-logo" style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'white', textDecoration: 'none' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54Z" />
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54Z" />
                    </svg>
                    DDAP
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link to="/dashboard" className="back-dashboard-btn">
                        ← {t("backToDashboard") || "Back to Dashboard"}
                    </Link>
                </div>
            </nav>

            <main className="dy-container">
                <header className="dy-header">
                    <h1 className="dy-title">{t("dyscalculiaMode")}</h1>
                    <p className="dy-subtitle">{t("headerSubtitle")}</p>
                </header>

                {/* Tests Carousel */}
                <section className="dy-panel" style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '32px', textAlign: 'center' }}>
                        {t("assessmentTests")}
                    </h2>
                    <div className="dy-carousel-container">
                        <button 
                            className="dy-nav-btn" 
                            onClick={() => setTestsCarouselIndex((prev) => (prev - 1 + testsData.length) % testsData.length)}
                        >
                            ❮
                        </button>
                        
                        <div className="dy-carousel-viewport">
                            <div className="dy-carousel-track" style={{ transform: `translateX(-${testsCarouselIndex * 100}%)` }}>
                                {testsData.map((test) => (
                                    <Link key={test.id} to={`/dycalculia/test/${test.id}`} className="dy-card">
                                        <div className="dy-card-icon">{test.icon}</div>
                                        <h3>{test.title}</h3>
                                        <p>{test.description}</p>
                                        <span style={{ color: '#3b82f6', fontWeight: '700', marginTop: '24px' }}>
                                            {t("startTest")} ➔
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <button 
                            className="dy-nav-btn" 
                            onClick={() => setTestsCarouselIndex((prev) => (prev + 1) % testsData.length)}
                        >
                            ❯
                        </button>
                    </div>
                </section>

                {/* Features Carousel */}
                <section className="dy-panel">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '32px', textAlign: 'center' }}>
                        {t("featuresSection")}
                    </h2>
                    <div className="dy-carousel-container">
                        <button 
                            className="dy-nav-btn" 
                            onClick={() => setFeaturesCarouselIndex((prev) => (prev - 1 + featuresData.length) % featuresData.length)}
                        >
                            ❮
                        </button>

                        <div className="dy-carousel-viewport">
                            <div className="dy-carousel-track" style={{ transform: `translateX(-${featuresCarouselIndex * 100}%)` }}>
                                {featuresData.map((feature, idx) => (
                                    <div key={idx} className="dy-card" onClick={feature.action}>
                                        <div className="dy-card-icon">{feature.icon}</div>
                                        <h3>{feature.title}</h3>
                                        <p>{feature.description}</p>
                                        <span style={{ color: '#3b82f6', fontWeight: '700', marginTop: '24px' }}>
                                            {t("start")} ➔
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button 
                            className="dy-nav-btn" 
                            onClick={() => setFeaturesCarouselIndex((prev) => (prev + 1) % featuresData.length)}
                        >
                            ❯
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}
