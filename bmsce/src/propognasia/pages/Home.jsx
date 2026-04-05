import React, { useState, useEffect } from "react";
import "../../dyslexia/pages/dyslexia.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../LanguageContext";

const Home = () => {
    const navigate = useNavigate();
    const { t, isDyslexicFont } = useLanguage();
    
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [carouselIndex, setCarouselIndex] = useState(0);

    const carouselItems = [
        {
            id: 'enroll',
            title: "Enroll Face",
            icon: "https://cdn-icons-png.flaticon.com/512/3034/3034057.png",
            path: "/enroll",
            description: "Register a new face to your personal database."
        },
        {
            id: 'identify',
            title: "Identify Faces",
            icon: "https://cdn-icons-png.flaticon.com/512/4680/4680072.png",
            path: "/identify",
            description: "Scan an image to recognize previously saved faces."
        }
    ];

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribeAuth();
    }, []);

    const nextSlide = () => setCarouselIndex((prev) => (prev + 1) % carouselItems.length);
    const prevSlide = () => setCarouselIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);

    return (
        <div className={`dyslexia-wrapper ${isDyslexicFont ? "opendyslexic-font" : ""}`}>
            <div className="snow-background"></div>

            {/* Standard Platform Navbar */}
            <nav className="dash-nav">
                <div className="dash-nav-left" onClick={() => navigate("/dashboard")}>
                    <div className="dash-brand">
                        <svg className="dash-logo" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54Z" />
                        </svg>
                        <span className="dash-brand-name">DDAP</span>
                    </div>
                </div>
                <div className="dash-nav-right">
                    <button onClick={() => navigate("/dashboard")} className="dash-logout-link">
                        ← {t("backToDashboard") || "Back"}
                    </button>
                </div>
            </nav>

            <main className="dys-main">
                <header className="dys-header">
                    <h1 className="dys-title">Prosopagnosia Assistant</h1>
                </header>

                <div className="dys-carousel-container">
                    <button onClick={prevSlide} className="dys-arrow-btn">❮</button>

                    <div className="dys-carousel-viewport">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={carouselIndex}
                                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="dys-carousel-frame"
                                onClick={() => navigate("/propognasia" + carouselItems[carouselIndex].path)}
                            >
                                <img
                                    src={carouselItems[carouselIndex].icon}
                                    alt=""
                                    className="dys-icon-image"
                                />
                                <h2 className="dys-carousel-title">{carouselItems[carouselIndex].title}</h2>
                                <p className="dys-carousel-desc">{carouselItems[carouselIndex].description}</p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <button onClick={nextSlide} className="dys-arrow-btn">❯</button>
                </div>

                <div className="dys-indicators">
                    {carouselItems.map((_, i) => (
                        <div
                            key={i}
                            className={`dys-indicator ${i === carouselIndex ? "active" : ""}`}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};
export default Home;
