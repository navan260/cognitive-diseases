import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import "../pages/dyscalculia.css";

export default function ARCountingGame({ onBack }) {
  const [isOpen, setIsOpen] = useState(false);
  const [objectCount, setObjectCount] = useState(0);
  const [popups, setPopups] = useState([]);
  const webcamRef = useRef(null);
  const containerRef = useRef(null);

  const startCamera = () => {
    setIsOpen(true);
  };

  const stopCamera = () => {
    setIsOpen(false);
    setObjectCount(0);
    setPopups([]);
  };

  const handleCanvasClick = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Increment count
    const newCount = objectCount + 1;
    setObjectCount(newCount);

    // Create popup
    const popupId = Date.now();
    setPopups((prev) => [...prev, { id: popupId, x, y, count: newCount }]);

    // Remove popup after animation
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== popupId));
    }, 1500);
  };

  const handleReset = () => {
    setObjectCount(0);
    setPopups([]);
  };

  return (
    <div className="dycalculia-wrapper" style={styles.container}>
      <div className="snow-background"></div>
      <style>{containerStyles}</style>

      <div style={{ marginTop: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
      {!isOpen && (
        <div style={styles.startScreen}>
          <div style={styles.startContent}>
            <div style={styles.bigIcon}>📸</div>
            <h2 style={{ color: 'white', marginBottom: '10px' }}>AR Object Counter</h2>
            <p>Click on objects in the camera feed to count them</p>
            <p style={styles.subText}>Manual counting with visual feedback</p>
            <button onClick={startCamera} style={styles.startButton}>
              Open Camera & Count 📷
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div style={styles.cameraScreen}>
          <div style={styles.header}>
            <div style={styles.counter}>
              Objects Counted: <span style={styles.counterValue}>{objectCount}</span>
            </div>
            <div style={styles.buttonGroup}>
              <button onClick={handleReset} style={styles.resetButton}>
                🔄 Reset
              </button>
              <button onClick={stopCamera} style={styles.closeButton}>
                ✕ Close
              </button>
            </div>
          </div>

          <div 
            ref={containerRef}
            style={styles.webcamContainer}
            onClick={handleCanvasClick}
          >
            <Webcam
              ref={webcamRef}
              style={styles.webcam}
              screenshotFormat="image/jpeg"
            />
            
            <div style={styles.countOverlay}>
              <div style={styles.countDisplay}>
                {objectCount}
              </div>
              <div style={styles.countLabel}>Counted</div>
            </div>

            {popups.map((popup) => (
              <div
                key={popup.id}
                style={{
                  ...styles.popup,
                  left: `${popup.x}px`,
                  top: `${popup.y}px`,
                }}
              >
                <div style={styles.popupNumber}>{popup.count}</div>
              </div>
            ))}
          </div>

          <div style={styles.instruction}>
            Click on objects to count them • Numbers appear on each click
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "20px",
    animation: "fadeIn 0.5s ease"
  },
  startScreen: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%"
  },
  startContent: {
    textAlign: "center",
    maxWidth: "400px",
    padding: "40px",
    background: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "white"
  },
  bigIcon: {
    fontSize: "64px",
    marginBottom: "20px"
  },
  subText: {
    marginBottom: "30px",
    fontSize: "14px",
    color: "#cbd5e1"
  },
  startButton: {
    padding: "14px 32px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)"
  },
  cameraScreen: {
    width: "100%",
    maxWidth: "700px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    color: "white",
    padding: "0 10px"
  },
  counter: {
    fontSize: "18px",
    fontWeight: "600"
  },
  counterValue: {
    color: "#22c55e",
    fontWeight: "700",
    fontSize: "24px",
    marginLeft: "8px"
  },
  buttonGroup: {
    display: "flex",
    gap: "12px"
  },
  resetButton: {
    padding: "8px 16px",
    background: "rgba(59, 130, 246, 0.2)",
    color: "#60a5fa",
    border: "1.5px solid #60a5fa",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s ease"
  },
  closeButton: {
    padding: "8px 16px",
    background: "rgba(170, 59, 255, 0.2)",
    color: "#c084fc",
    border: "1.5px solid #c084fc",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s ease"
  },
  webcamContainer: {
    position: "relative",
    width: "100%",
    borderRadius: "16px",
    overflow: "hidden",
    marginBottom: "20px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
    aspectRatio: "16/9",
    cursor: "crosshair"
  },
  webcam: {
    width: "100%",
    height: "100%",
    display: "block"
  },
  countOverlay: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    background: "rgba(34, 197, 94, 0.9)",
    padding: "20px 30px",
    borderRadius: "12px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
    pointerEvents: "none"
  },
  countDisplay: {
    fontSize: "48px",
    fontWeight: "700",
    color: "white"
  },
  countLabel: {
    fontSize: "14px",
    color: "#e0f7e0",
    marginTop: "4px"
  },
  popup: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    zIndex: 10,
    animation: "popupFloat 1.5s ease-out forwards"
  },
  popupNumber: {
    fontSize: "32px",
    fontWeight: "700",
    color: "white",
    background: "rgba(170, 59, 255, 0.9)",
    padding: "12px 20px",
    borderRadius: "50%",
    minWidth: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 20px rgba(170, 59, 255, 0.5)"
  },
  instruction: {
    textAlign: "center",
    color: "#cbd5e1",
    fontSize: "16px",
    marginTop: "12px"
  }
};

const containerStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes popupFloat {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(0.8);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -80px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -120px) scale(0.8);
    }
  }
`;
