import React, { useState, useEffect } from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { collection, query, orderBy, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/LanguageContext";
import { getTranslation, languages } from "@/translations";

const Home = () => {
    const navigate = useNavigate();
    const { language, changeLanguage } = useLanguage();
    const t = (key) => getTranslation(language, key);
    
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

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

    // Get current user
    useEffect(() => {
        console.log("Auth useEffect starting...");
        
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            console.log("Auth state changed:", currentUser?.email || "No user");
            setUser(currentUser);
            setAuthLoading(false);
            if (!currentUser) {
                setRecords([]);
                setLoading(false);
            }
        });

        // Also check immediately if user exists
        if (auth.currentUser) {
            console.log("Current user found immediately:", auth.currentUser.email);
            setUser(auth.currentUser);
            setAuthLoading(false);
        }

        return () => unsubscribeAuth();
    }, []);

    // Fetch user's records from Firestore
    useEffect(() => {
        if (!user) {
            setRecords([]);
            setLoading(false);
            return;
        }

        console.log("Fetching records for user:", user.uid);
        setLoading(true);
        
        try {
            // First try with orderBy (requires composite index)
            const q = query(
                collection(db, "records"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                console.log("Records found:", snapshot.docs.length);
                const recordsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRecords(recordsData);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching records (with orderBy):", error);
                console.log("Trying without orderBy...");
                
                // Fallback: try without orderBy
                const qFallback = query(
                    collection(db, "records"),
                    where("userId", "==", user.uid)
                );

                const unsubscribeFallback = onSnapshot(qFallback, (snapshot) => {
                    console.log("Records found (fallback):", snapshot.docs.length);
                    const recordsData = snapshot.docs
                        .map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }))
                        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
                    setRecords(recordsData);
                    setLoading(false);
                }, (fallbackError) => {
                    console.error("Error fetching records (fallback):", fallbackError);
                    setLoading(false);
                });

                return () => unsubscribeFallback();
            });

            return () => unsubscribe();
        } catch (err) {
            console.error("Query setup error:", err);
            setLoading(false);
        }
    }, [user]);

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");
        setLoginLoading(true);
        
        try {
            await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            setShowLogin(false);
            setLoginEmail("");
            setLoginPassword("");
        } catch (error) {
            console.error("Login error:", error);
            setLoginError(error.message || "Login failed");
        } finally {
            setLoginLoading(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            setRecords([]);
            setUser(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <div style={styles.container}>
            {/* Language Selector */}
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

            {/* User Info Header */}
            {user && (
                <div style={styles.userHeader}>
                    <span style={styles.userInfo}>👤 {user.email}</span>
                    <button 
                        onClick={handleLogout}
                        style={styles.logoutBtn}
                    >
                        {t("logout")}
                    </button>
                </div>
            )}

            <header style={styles.header}>
                <h1 style={styles.heading}>{t("dyslexiaMode")}</h1>
            </header>

            <div style={styles.carouselContainer}>
                <button onClick={prevSlide} style={styles.arrowBtn}>❮</button>

                <div style={styles.carouselViewport}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={carouselIndex}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -50, scale: 0.9 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            style={styles.carouselFrame}
                            onClick={() => navigate("/dyslexia" + carouselItems[carouselIndex].path)}
                        >
                            <div style={styles.carouselIcon}>
                                {carouselItems[carouselIndex].iconType === 'image' ? (
                                    <img
                                        src={carouselItems[carouselIndex].icon}
                                        alt=""
                                        style={styles.iconImage}
                                    />
                                ) : (
                                    carouselItems[carouselIndex].icon
                                )}
                            </div>
                            <h2 style={styles.carouselTitle}>{carouselItems[carouselIndex].title}</h2>
                            <p style={styles.carouselDesc}>{carouselItems[carouselIndex].description}</p>
                            <div style={styles.glimmer}></div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <button onClick={nextSlide} style={styles.arrowBtn}>❯</button>
            </div>

            <div style={styles.indicatorContainer}>
                {carouselItems.map((_, i) => (
                    <div
                        key={i}
                        style={{
                            ...styles.indicator,
                            width: i === carouselIndex ? "24px" : "8px",
                            background: i === carouselIndex ? "#60a5fa" : "rgba(255,255,255,0.2)"
                        }}
                    />
                ))}
            </div>

            <div style={styles.recordsSection}>
                <h2 style={styles.sectionTitle}>📚 {t("previousRecords")}</h2>

                {authLoading ? (
                    <p style={styles.statusText}>{t("checkingAuth")}</p>
                ) : !user ? (
                    <div style={styles.statusContainer}>
                        <p style={styles.statusText}>{t("pleaseLogin")}</p>
                        <button 
                            onClick={() => setShowLogin(true)}
                            style={styles.loginButtonVisible}
                        >
                            {t("loginHere")}
                        </button>
                    </div>
                ) : loading ? (
                    <p style={styles.statusText}>{t("loadingRecords")}</p>
                ) : records.length === 0 ? (
                    <p style={styles.statusText}>{t("noRecordsYet")}</p>
                ) : (
                    <div style={styles.recordsGrid}>
                        {records.map((record) => (
                            <div
                                key={record.id}
                                style={styles.recordCard}
                                onClick={() => setSelectedRecord(record)}
                            >
                                <div style={styles.recordHeader}>
                                    <span style={styles.typeTag}>
                                        {record.type === "live" ? t("live") : record.type === "audio" ? t("mp3") : t("pdf")}
                                    </span>
                                    <span style={styles.dateText}>
                                        {record.createdAt?.toDate().toLocaleDateString() || t("recent")}
                                    </span>
                                </div>
                                <p style={styles.transcriptSnippet}>
                                    {record.original?.substring(0, 100)}...
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* DETAIL MODAL */}
            {selectedRecord && (
                <div style={styles.modalOverlay} onClick={() => setSelectedRecord(null)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setSelectedRecord(null)}>{t("close")}</button>
                        <h2 style={styles.modalTitle}>
                            {selectedRecord.type.toUpperCase()} {t("session")} - {selectedRecord.createdAt?.toDate().toLocaleDateString()}
                        </h2>

                        <div style={styles.modalBody}>
                            <div style={styles.detailSection}>
                                <h3 style={styles.detailTitle}>{t("summary")}</h3>
                                <p style={styles.detailText}>{selectedRecord.summary}</p>
                            </div>

                            <div style={styles.detailSection}>
                                <h3 style={styles.detailTitle}>{t("syllables")}</h3>
                                <p style={styles.detailText}>{selectedRecord.syllables}</p>
                            </div>

                            <div style={styles.detailSection}>
                                <h3 style={styles.detailTitle}>{t("flowChart")}</h3>
                                <pre style={styles.flowPre}>{selectedRecord.mindmap}</pre>
                            </div>

                            <div style={styles.detailSection}>
                                <h3 style={styles.detailTitle}>{t("originalText")}</h3>
                                <p style={styles.detailText}>{selectedRecord.original}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LOGIN MODAL */}
            {showLogin && (
                <div style={styles.modalOverlay} onClick={() => setShowLogin(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setShowLogin(false)}>{t("close")}</button>
                        <h2 style={styles.modalTitle}>{t("loginToDyslexia")}</h2>

                        <form onSubmit={handleLogin} style={styles.loginForm}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>{t("email")}</label>
                                <input
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                    style={styles.input}
                                    placeholder={t("emailPlaceholder")}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>{t("password")}</label>
                                <input
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                    style={styles.input}
                                    placeholder={t("passwordPlaceholder")}
                                />
                            </div>

                            {loginError && (
                                <p style={styles.errorText}>❌ {loginError}</p>
                            )}

                            <button 
                                type="submit"
                                style={styles.loginBtn}
                                disabled={loginLoading}
                            >
                                {loginLoading ? t("loggingIn") : t("loginButton")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        background: "transparent",
        color: "white",
        minHeight: "100vh",
        padding: "50px 20px",
        textAlign: "center",
        fontFamily: "'OpenDyslexic', sans-serif",
    },
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
    userHeader: {
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 100,
        padding: "10px 20px",
        background: "rgba(30, 41, 59, 0.8)",
        borderRadius: "12px",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(96, 165, 250, 0.3)",
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },
    userInfo: {
        fontSize: "14px",
        color: "#60a5fa",
        fontWeight: 600,
    },
    logoutBtn: {
        background: "rgba(239, 68, 68, 0.2)",
        border: "1px solid #ef4444",
        color: "#fca5a5",
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
    },
    heading: {
        fontSize: "36px",
        fontWeight: 800,
        marginBottom: "60px",
        letterSpacing: "3px",
        color: "#f8fafc",
    },
    carouselContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "40px",
        marginBottom: "20px",
        padding: "20px",
    },
    carouselViewport: {
        width: "320px",
        height: "220px",
        position: "relative",
        cursor: "pointer",
        perspective: "1000px",
    },
    carouselFrame: {
        background: "rgba(30, 41, 59, 0.4)",
        border: "2px solid rgba(96, 165, 250, 0.3)",
        borderRadius: "24px",
        padding: "30px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        overflow: "hidden",
        position: "relative",
    },
    carouselIcon: {
        fontSize: "50px",
        marginBottom: "15px",
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    iconImage: {
        height: "100%",
        width: "auto",
        objectFit: "contain",
    },
    carouselTitle: {
        fontSize: "20px",
        fontWeight: 700,
        color: "#f1f5f9",
        margin: "0 0 8px 0",
    },
    carouselDesc: {
        fontSize: "14px",
        color: "#94a3b8",
        margin: 0,
    },
    arrowBtn: {
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "white",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        transition: "all 0.2s",
        backdropFilter: "blur(4px)",
    },
    indicatorContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "8px",
        marginBottom: "60px",
    },
    indicator: {
        height: "8px",
        borderRadius: "4px",
        transition: "all 0.3s ease",
    },
    glimmer: {
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "linear-gradient(45deg, transparent, rgba(96, 165, 250, 0.1), transparent)",
        animation: "glimmer 3s infinite linear",
    },
    recordsSection: {
        maxWidth: "900px",
        margin: "0 auto",
        textAlign: "left",
    },
    sectionTitle: {
        fontSize: "22px",
        color: "#94a3b8",
        marginBottom: "20px",
        borderBottom: "1px solid rgba(30, 41, 59, 0.5)",
        paddingBottom: "10px",
    },
    statusText: {
        color: "#475569",
        textAlign: "center",
        padding: "40px",
    },
    recordsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "20px",
    },
    recordCard: {
        background: "rgba(15, 23, 42, 0.7)",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid rgba(30, 41, 59, 0.5)",
        cursor: "pointer",
        transition: "transform 0.2s, background 0.2s",
        backdropFilter: "blur(8px)",
    },
    recordHeader: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "12px",
    },
    typeTag: {
        fontSize: "11px",
        fontWeight: 700,
        padding: "4px 8px",
        borderRadius: "6px",
        background: "#1e293b",
        color: "#60a5fa",
        textTransform: "uppercase",
    },
    dateText: {
        fontSize: "12px",
        color: "#64748b",
    },
    transcriptSnippet: {
        fontSize: "14px",
        color: "#94a3b8",
        lineHeight: "1.5",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
    },
    modalContent: {
        background: "#0f172a",
        width: "100%",
        maxWidth: "800px",
        maxHeight: "90vh",
        borderRadius: "24px",
        position: "relative",
        padding: "40px",
        overflowY: "auto",
        border: "1px solid #334155",
    },
    closeBtn: {
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "none",
        border: "none",
        color: "#64748b",
        cursor: "pointer",
        fontSize: "14px",
    },
    modalTitle: {
        marginBottom: "30px",
        fontSize: "20px",
        color: "#f8fafc",
        textAlign: "center",
    },
    modalBody: {
        textAlign: "left",
    },
    detailSection: {
        marginBottom: "25px",
    },
    detailTitle: {
        fontSize: "16px",
        color: "#3b82f6",
        marginBottom: "10px",
    },
    detailText: {
        color: "#cbd5e1",
        lineHeight: "1.6",
        fontSize: "15px",
        whiteSpace: "pre-wrap",
    },
    flowPre: {
        background: "#020617",
        padding: "20px",
        borderRadius: "12px",
        color: "#e2e8f0",
        fontFamily: "monospace",
        fontSize: "13px",
        overflowX: "auto",
        border: "1px solid #1e293b",
    },
    statusContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        padding: "40px",
    },
    loginButtonVisible: {
        background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
        color: "white",
        border: "none",
        padding: "12px 30px",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
    },
    loginForm: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        textAlign: "left",
    },
    label: {
        color: "#cbd5e1",
        fontSize: "14px",
        fontWeight: 500,
    },
    input: {
        background: "#1e293b",
        border: "1px solid #334155",
        color: "white",
        padding: "10px 12px",
        borderRadius: "6px",
        fontSize: "14px",
        fontFamily: "inherit",
    },
    loginBtn: {
        background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
        color: "white",
        border: "none",
        padding: "12px 20px",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: 600,
        cursor: "pointer",
        marginTop: "10px",
        transition: "all 0.2s",
    },
    errorText: {
        color: "#ef4444",
        fontSize: "14px",
        margin: "0",
    },
};

export default Home;
