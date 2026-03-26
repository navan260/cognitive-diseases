import { Link } from "react-router-dom";

export default function Home() {
    return (
        <>
            <HomeStyles />
            <div className="home-screen">
                <header className="home-header">
                    <h1 className="home-title">Dyscalculia <span>Assessment</span></h1>
                    <p className="home-subtitle">Let’s understand how you think with numbers 🧠</p>
                </header>

                <div className="test-options">
                    <Link to="/test/dot" className="test-card">
                        <div className="test-card-icon">🔢</div>
                        <h2>Dots Comparison</h2>
                        <p>Identify which box has more dots. Tests your rapid number sense and visual estimation.</p>
                        <span className="test-action">Start Test ➔</span>
                    </Link>

                    <Link to="/test/numberline" className="test-card">
                        <div className="test-card-icon">📏</div>
                        <h2>Number Line</h2>
                        <p>Place a number accurately on a physical scale. Tests your spatial mathematical reasoning.</p>
                        <span className="test-action">Start Test ➔</span>
                    </Link>
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
    `}</style>
    );
}