import React, { useState, useEffect } from "react";
import "./dyslexia.css";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { collection, query, orderBy, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/LanguageContext";
import { getTranslation, languages } from "@/translations";
import { logout } from "../../auth";

const Home = () => {
    const navigate = useNavigate();
    const { language, changeLanguage, t, isDyslexicFont, toggleDyslexicFont } = useLanguage();
    
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [user, setUser] = useState(null);

    const carouselItems = [
        {
            id: 'live',
            title: t("liveTranscription"),
            icon: "https://png.pngtree.com/png-vector/20250319/ourmid/pngtree-a-high-quality-studio-microphone-ensuring-excellent-sound-quality-for-vocal-png-image_15749730.png",
            iconType: 'image',
            path: "/live",
            description: t("realTimeSpeechToText")
        },
        {
            id: 'mp3',
            title: t("uploadMp3"),
            icon: "https://www.freeiconspng.com/uploads/file-mp3-music-music-file-song-icon-27.png",
            iconType: 'image',
            path: "/upload",
            description: t("analyzeAudioFiles")
        },
        {
            id: 'pdf',
            title: t("uploadPdf"),
            icon: "https://cdn-icons-png.flaticon.com/256/337/337946.png",
            iconType: 'image',
            path: "/pdf-upload",
            description: t("extractTextFromDocs")
        }
    ];

    const nextSlide = () => setCarouselIndex((prev) => (prev + 1) % carouselItems.length);
    const prevSlide = () => setCarouselIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
            if (!currentUser) {
                setRecords([]);
                setLoading(false);
            }
        });

        if (auth.currentUser) {
            setUser(auth.currentUser);
            setAuthLoading(false);
        }

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!user) {
            setRecords([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, "records"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const recordsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRecords(recordsData);
                setLoading(false);
            }, (error) => {
                console.log("Retrying without orderBy...");
                const qFallback = query(
                    collection(db, "records"),
                    where("userId", "==", user.uid)
                );

                const unsubscribeFallback = onSnapshot(qFallback, (snapshot) => {
                    const recordsData = snapshot.docs
                        .map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }))
                        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
                    setRecords(recordsData);
                    setLoading(false);
                });

                return () => unsubscribeFallback();
            });

            return () => unsubscribe();
        } catch (err) {
            setLoading(false);
        }
    }, [user]);

    return (
        <div className={`dyslexia-wrapper ${isDyslexicFont ? "opendyslexic-font" : ""}`}>
            <div className="snow-background"></div>

            <main className="dys-main">
                <header className="dys-header">
                    <div className="font-helper-bar">
                        <button onClick={toggleDyslexicFont} className="font-helper-btn">
                            {isDyslexicFont ? t("defaultFont") : t("fontHelper")}
                        </button>
                    </div>
                    <h1 className="dys-title">{t("dyslexiaMode")}</h1>
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
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="dys-carousel-frame"
                                onClick={() => navigate("/dyslexia" + carouselItems[carouselIndex].path)}
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

                <div className="records-section">
                    <div className="section-header">
                        <h2 className="section-title">📚 {t("previousRecords")}</h2>
                    </div>

                    {authLoading ? (
                        <div className="status-box"><p>{t("checkingAuth")}</p></div>
                    ) : !user ? (
                        <div className="status-box login-prompt-box">
                            <p>{t("pleaseLogin")}</p>
                            <button onClick={() => navigate("/auth")} className="dys-btn-primary">
                                {t("loginHere")}
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="status-box"><p>{t("loadingRecords")}</p></div>
                    ) : records.length === 0 ? (
                        <div className="status-box"><p>{t("noRecordsYet")}</p></div>
                    ) : (
                        <div className="records-grid">
                            {records.map((record) => (
                                <div
                                    key={record.id}
                                    className="record-card"
                                    onClick={() => setSelectedRecord(record)}
                                >
                                    <div className="record-card-header">
                                        <span className="type-tag">
                                            {record.type === "live" ? t("live") : record.type === "audio" ? t("mp3") : t("pdf")}
                                        </span>
                                        <span className="record-date">
                                            {record.createdAt?.toDate().toLocaleDateString() || t("recent")}
                                        </span>
                                    </div>
                                    <p className="record-snippet">
                                        {record.original?.substring(0, 100)}...
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* DETAIL MODAL */}
            {selectedRecord && (
                <div className="dys-modal-overlay" onClick={() => setSelectedRecord(null)}>
                    <div className="dys-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="dys-modal-close" onClick={() => setSelectedRecord(null)}>{t("close")}</button>
                        <h2 className="dys-modal-title">
                            {selectedRecord.type.toUpperCase()} {t("session")}
                        </h2>

                        <div className="modal-body">
                            <div className="modal-detail-section">
                                <h3 className="detail-label">{t("summary")}</h3>
                                <p className="detail-content">{selectedRecord.summary}</p>
                            </div>

                            <div className="modal-detail-section">
                                <h3 className="detail-label">{t("syllables")}</h3>
                                <p className="detail-content">{selectedRecord.syllables}</p>
                            </div>

                            <div className="modal-detail-section">
                                <h3 className="detail-label">{t("flowChart")}</h3>
                                <pre className="flow-chart-box">{selectedRecord.mindmap}</pre>
                            </div>

                            <div className="modal-detail-section">
                                <h3 className="detail-label">{t("originalText")}</h3>
                                <p className="detail-content">{selectedRecord.original}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Home;
