import { Link } from "react-router-dom";
import ARCountingGame from "../components/ARCountingGame";
import MusicMathGame from "../components/MusicMathGame";
import StoryMode from "../components/StoryMode";
import { useState } from "react";

export default function Home() {
    const [showARCounter, setShowARCounter] = useState(false);
    const [showMusicGame, setShowMusicGame] = useState(false);
    const [showStoryMode, setShowStoryMode] = useState(false);
    const [testsCarouselIndex, setTestsCarouselIndex] = useState(0);
    const [featuresCarouselIndex, setFeaturesCarouselIndex] = useState(0);

    if (showARCounter) {
        return <ARCountingGame />;
    }

    if (showMusicGame) {
        return <MusicMathGame />;
    }

    if (showStoryMode) {
        return <StoryMode />;
    }

    const testsData = [
        {
            id: "dot",
            icon: "🔢",
            title: "Dots Comparison",
            description: "Identify which box has more dots. Tests your rapid number sense and visual estimation.",
        },
        {
            id: "numberline",
            icon: "📏",
            title: "Number Line",
            description: "Place a number accurately on a physical scale. Tests your spatial mathematical reasoning.",
        },
        {
            id: "arithmetic",
            icon: "🧮",
            title: "Arithmetic Test",
            description: "Solve basic math problems. Tests your calculation speed and accuracy with numbers.",
        },
    ];

    const featuresData = [
        {
            icon: "📸",
            title: "AR Object Counter",
            description: "Open your camera to click and count objects in real-time",
            action: () => setShowARCounter(true),
        },
        {
            icon: "🎵",
            title: "Music Math Game",
            description: "Learn math through rhythm and beats. Tap to count and solve equations",
            action: () => setShowMusicGame(true),
        },
        {
            icon: "📖",
            title: "Story Mode",
            description: "Convert math problems into engaging AI-generated stories for better understanding",
            action: () => setShowStoryMode(true),
        },
    ];

    const handleTestsNext = () => {
        setTestsCarouselIndex((prev) => (prev + 1) % testsData.length);
    };

    const handleTestsPrev = () => {
        setTestsCarouselIndex((prev) => (prev - 1 + testsData.length) % testsData.length);
    };

    const handleFeaturesNext = () => {
        setFeaturesCarouselIndex((prev) => (prev + 1) % featuresData.length);
    };

    const handleFeaturesPrev = () => {
        setFeaturesCarouselIndex((prev) => (prev - 1 + featuresData.length) % featuresData.length);
    };

    return (
        <>
            <HomeStyles />
            <div className="home-screen">
                <header className="home-header">
                    <h1 className="home-title">Dyscalculia <span>Assessment</span></h1>
                    <p className="home-subtitle">Let’s understand how you think with numbers 🧠</p>
                </header>

                {/* Tests Carousel */}
                <div className="carousel-section">
                    <h2 className="section-heading">Assessment Tests</h2>
                    <div className="carousel-container">
                        <button className="carousel-btn carousel-prev" onClick={handleTestsPrev}>
                            ❮
                        </button>
                        
                        <div className="carousel-viewport">
                            <div className="carousel-track" style={{ transform: `translateX(-${testsCarouselIndex * 100}%)` }}>
                                {testsData.map((test) => (
                                    <div key={test.id} className="carousel-slide test-card">
                                        <Link to={`/test/${test.id}`} className="test-link">
                                            <div className="test-card-icon">{test.icon}</div>
                                            <h2>{test.title}</h2>
                                            <p>{test.description}</p>
                                            <span className="test-action">Start Test ➔</span>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="carousel-btn carousel-next" onClick={handleTestsNext}>
                            ❯
                        </button>
                    </div>

                    {/* Carousel Indicators */}
                    <div className="carousel-indicators">
                        {testsData.map((_, idx) => (
                            <button
                                key={idx}
                                className={`indicator ${idx === testsCarouselIndex ? "active" : ""}`}
                                onClick={() => setTestsCarouselIndex(idx)}
                            />
                        ))}
                    </div>
                </div>

                {/* Features Carousel */}
                <div className="carousel-section">
                    <h2 className="section-heading">✨ Features</h2>
                    <div className="carousel-container">
                        <button className="carousel-btn carousel-prev" onClick={handleFeaturesPrev}>
                            ❮
                        </button>

                        <div className="carousel-viewport">
                            <div className="carousel-track" style={{ transform: `translateX(-${featuresCarouselIndex * 100}%)` }}>
                                {featuresData.map((feature, idx) => (
                                    <div key={idx} className="carousel-slide feature-card">
                                        <button onClick={feature.action} className="feature-button">
                                            <div className="feature-icon">{feature.icon}</div>
                                            <h3>{feature.title}</h3>
                                            <p>{feature.description}</p>
                                            <span className="feature-action">Start ➔</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="carousel-btn carousel-next" onClick={handleFeaturesNext}>
                            ❯
                        </button>
                    </div>

                    {/* Carousel Indicators */}
                    <div className="carousel-indicators">
                        {featuresData.map((_, idx) => (
                            <button
                                key={idx}
                                className={`indicator ${idx === featuresCarouselIndex ? "active" : ""}`}
                                onClick={() => setFeaturesCarouselIndex(idx)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

function HomeStyles() {
    return (
        <style>{`
      .home-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 40px 20px;
        box-sizing: border-box;
        animation: fadeIn 0.6s ease;
      }

      .home-header {
        text-align: center;
        margin-bottom: 60px;
        z-index: 10;
      }

      .home-title {
        font-size: 3.5rem;
        font-weight: 800;
        margin: 0 0 16px;
        color: var(--text-h);
        letter-spacing: -1.5px;
      }
      .home-title span {
        color: var(--accent);
      }

      .home-subtitle {
        font-size: 1.25rem;
        color: var(--text);
        margin: 0;
        opacity: 0.8;
      }

      .test-options {
        display: flex;
        gap: 32px;
        flex-wrap: wrap;
        justify-content: center;
        z-index: 10;
        max-width: 900px;
      }

      .test-card {
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 40px 32px;
        border-radius: 24px;
        width: 380px;
        text-decoration: none;
        color: var(--text-h);
        display: flex;
        flex-direction: column;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        box-sizing: border-box;
      }

      .test-card:hover {
        transform: translateY(-8px) scale(1.02);
        background: rgba(30, 41, 59, 0.95);
        border-color: var(--accent-border);
        box-shadow: 0 20px 60px rgba(170, 59, 255, 0.15);
      }

      .test-card-icon {
        font-size: 3rem;
        margin-bottom: 24px;
        background: var(--bg);
        width: 80px; height: 80px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 20px;
        box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);
      }

      .test-card h2 {
        font-size: 1.8rem;
        margin: 0 0 12px;
      }

      .test-card p {
        font-size: 1rem;
        color: var(--text);
        line-height: 1.6;
        margin: 0 0 32px;
        flex-grow: 1;
      }

      .test-action {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--accent);
        display: inline-flex;
        align-items: center;
      }
      
      .test-card:hover .test-action {
        color: #fff;
      }

      /* Features Section */
      .features-section {
        width: 100%;
        margin-top: 80px;
        padding: 0 20px;
        animation: fadeIn 0.8s ease 0.3s backwards;
      }

      .features-heading {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-h);
        text-align: center;
        margin: 0 0 40px;
        letter-spacing: -0.5px;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 32px;
        max-width: 1000px;
        margin: 0 auto;
        padding: 0;
      }

      .feature-card {
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(170, 59, 255, 0.3);
        padding: 40px 32px;
        border-radius: 24px;
        text-decoration: none;
        color: var(--text-h);
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        box-sizing: border-box;
        cursor: pointer;
        border: none;
      }

      .feature-card:hover {
        transform: translateY(-8px) scale(1.02);
        background: rgba(30, 41, 59, 0.95);
        border-color: rgba(170, 59, 255, 0.5);
        box-shadow: 0 20px 60px rgba(170, 59, 255, 0.2);
      }

      .feature-icon {
        font-size: 3rem;
        margin-bottom: 24px;
        background: var(--bg);
        width: 80px; 
        height: 80px;
        display: flex; 
        align-items: center; 
        justify-content: center;
        border-radius: 20px;
        box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);
      }

      .feature-card h3 {
        font-size: 1.8rem;
        margin: 0 0 12px;
        font-weight: 600;
      }

      .feature-card p {
        font-size: 1rem;
        color: var(--text);
        line-height: 1.6;
        margin: 0 0 32px;
        flex-grow: 1;
      }

      .feature-action {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--accent);
        display: inline-flex;
        align-items: center;
      }
      
      .feature-card:hover .feature-action {
        color: #fff;
      }

      /* AR Feature Section (deprecated, kept for compatibility) */
      .ar-feature-section {
        width: 100%;
        margin-top: 80px;
        padding: 60px 20px;
        text-align: center;
        animation: fadeIn 0.8s ease 0.3s backwards;
      }

      .ar-feature-card {
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(170, 59, 255, 0.3);
        padding: 40px 32px;
        border-radius: 24px;
        max-width: 500px;
        text-decoration: none;
        color: var(--text-h);
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        box-sizing: border-box;
        cursor: pointer;
        border: none;
        margin: 0 auto;
      }

      .ar-feature-card:hover {
        transform: translateY(-8px) scale(1.02);
        background: rgba(30, 41, 59, 0.95);
        border-color: rgba(170, 59, 255, 0.5);
        box-shadow: 0 20px 60px rgba(170, 59, 255, 0.2);
      }

      .ar-feature-icon {
        font-size: 3rem;
        margin-bottom: 24px;
        background: var(--bg);
        width: 80px; height: 80px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 20px;
        box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);
      }

      .ar-feature-card h2 {
        font-size: 1.8rem;
        margin: 0 0 12px;
      }

      .ar-feature-card p {
        font-size: 1rem;
        color: var(--text);
        line-height: 1.6;
        margin: 0 0 32px;
        flex-grow: 1;
      }

      .ar-feature-action {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--accent);
        display: inline-flex;
        align-items: center;
      }
      
      .ar-feature-card:hover .ar-feature-action {
        color: #fff;
      }

      /* Carousel Styles */
      .carousel-section {
        width: 100%;
        margin-top: 80px;
        padding: 0 20px;
        animation: fadeIn 0.8s ease 0.3s backwards;
      }

      .section-heading {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-h);
        text-align: center;
        margin: 0 0 40px;
        letter-spacing: -0.8px;
        font-family: 'Courier New', 'Courier', monospace;
      }

      .carousel-container {
        display: flex;
        align-items: center;
        gap: 16px;
        max-width: 1200px;
        margin: 0 auto;
        justify-content: center;
      }

      .carousel-btn {
        background: rgba(170, 59, 255, 0.2);
        border: 1.5px solid rgba(170, 59, 255, 0.4);
        color: var(--accent);
        width: 50px;
        height: 50px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .carousel-btn:hover {
        background: rgba(170, 59, 255, 0.4);
        border-color: rgba(170, 59, 255, 0.6);
        transform: scale(1.1);
      }

      .carousel-viewport {
        flex: 1;
        overflow: hidden;
        border-radius: 24px;
      }

      .carousel-track {
        display: flex;
        transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        gap: 32px;
        padding: 20px;
      }

      .carousel-slide {
        flex: 0 0 100%;
        display: flex;
        justify-content: center;
      }

      .carousel-slide.test-card {
        display: flex;
      }

      .test-link {
        display: contents;
      }

      .carousel-slide.feature-card {
        display: flex;
      }

      .feature-button {
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(170, 59, 255, 0.3);
        padding: 40px 32px;
        border-radius: 24px;
        text-decoration: none;
        color: var(--text-h);
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        box-sizing: border-box;
        cursor: pointer;
        width: 100%;
        max-width: 400px;
      }

      .feature-button:hover {
        transform: translateY(-8px) scale(1.02);
        background: rgba(30, 41, 59, 0.95);
        border-color: rgba(170, 59, 255, 0.5);
        box-shadow: 0 20px 60px rgba(170, 59, 255, 0.2);
      }

      .carousel-indicators {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 24px;
      }

      .indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid rgba(170, 59, 255, 0.3);
        background: transparent;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .indicator.active {
        background: var(--accent);
        border-color: var(--accent);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `}</style>
    );
}