import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [carouselIndex, setCarouselIndex] = useState(0);

    const carouselItems = [
        {
            id: 'live',
            title: "Live Transcription",
            icon: "https://png.pngtree.com/png-vector/20250319/ourmid/pngtree-a-high-quality-studio-microphone-ensuring-excellent-sound-quality-for-vocal-png-image_15749730.png",
            iconType: 'image',
            path: "/live",
            description: "Real-time speech to text"
        },
        {
            id: 'mp3',
            title: "Upload MP3",
            icon: "https://www.freeiconspng.com/uploads/file-mp3-music-music-file-song-icon-27.png",
            iconType: 'image',
            path: "/upload",
            description: "Analyze audio files"
        },
        {
            id: 'pdf',
            title: "Upload PDF",
            icon: "https://cdn-icons-png.flaticon.com/256/337/337946.png",
            iconType: 'image',
            path: "/pdf-upload",
            description: "Extract text from docs"
        }
    ];

    const nextSlide = () => setCarouselIndex((prev) => (prev + 1) % carouselItems.length);
    const prevSlide = () => setCarouselIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);

    useEffect(() => {
        const q = query(collection(db, "records"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const recordsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRecords(recordsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching records: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.heading}>DYSLEXIA MODE</h1>
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
                            onClick={() => navigate(carouselItems[carouselIndex].path)}
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
                <h2 style={styles.sectionTitle}>📚 Previous Records</h2>

                {loading ? (
                    <p style={styles.statusText}>⏳ Loading records...</p>
                ) : records.length === 0 ? (
                    <p style={styles.statusText}>No data yet...</p>
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
                                        {record.type === "live" ? "🎙 Live" : record.type === "audio" ? "🎵 MP3" : "📄 PDF"}
                                    </span>
                                    <span style={styles.dateText}>
                                        {record.createdAt?.toDate().toLocaleDateString() || "Recent"}
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
                        <button style={styles.closeBtn} onClick={() => setSelectedRecord(null)}>close</button>
                        <h2 style={styles.modalTitle}>
                            {selectedRecord.type.toUpperCase()} SESSION - {selectedRecord.createdAt?.toDate().toLocaleDateString()}
                        </h2>

                        <div style={styles.modalBody}>
                            <div style={styles.detailSection}>
                                <h3 style={styles.detailTitle}>📄 Summary</h3>
                                <p style={styles.detailText}>{selectedRecord.summary}</p>
                            </div>

                            <div style={styles.detailSection}>
                                <h3 style={styles.detailTitle}>🔤 Syllables</h3>
                                <p style={styles.detailText}>{selectedRecord.syllables}</p>
                            </div>

                            <div style={styles.detailSection}>
                                <h3 style={styles.detailTitle}>📊 Flow Chart</h3>
                                <pre style={styles.flowPre}>{selectedRecord.mindmap}</pre>
                            </div>

                            <div style={styles.detailSection}>
                                <h3 style={styles.detailTitle}>📝 Original Text</h3>
                                <p style={styles.detailText}>{selectedRecord.original}</p>
                            </div>
                        </div>
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
};

export default Home;