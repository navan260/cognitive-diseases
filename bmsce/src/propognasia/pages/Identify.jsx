import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "../../dyslexia/pages/dyslexia.css";

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

const Identify = () => {
    const webcamRef = useRef(null);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [status, setStatus] = useState("");
    const [imgSrc, setImgSrc] = useState(null);
    const [results, setResults] = useState([]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribeAuth();
    }, []);

    const handleIdentify = async (src, currentUser) => {
        if (!currentUser) {
            setStatus("Please log in first!");
            return;
        }
        
        setStatus("Scanning face...");
        setResults([]);
        
        try {
            const blob = dataURItoBlob(src);
            const formData = new FormData();
            formData.append("file", blob, "capture.jpg");
            formData.append("userId", currentUser.uid);
            
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/propognasia/identify`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            
            if (data.success) {
                if (data.matches && data.matches.length > 0) {
                    setResults(data.matches);
                    setStatus(`Found ${data.matches.length} face(s)`);
                } else {
                    setStatus("Faces found but unknown.");
                }
            } else {
                setStatus(data.message || `Error: ${data.error}`);
            }
        } catch (error) {
            setStatus(`Failed to connect to server: ${error.message}`);
        }
    };

    const capture = React.useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        handleIdentify(imageSrc, user);
    }, [webcamRef, user]);

    return (
        <div className="dyslexia-wrapper">
            <div className="snow-background"></div>

            <main className="dys-main" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <h1 className="dys-title">Identify Face</h1>
                
                <div className="webcam-container">
                    {!imgSrc ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "user" }}
                            className="dys-webcam"
                        />
                    ) : (
                        <img src={imgSrc} alt="captured" className="dys-webcam" />
                    )}
                </div>
                
                <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
                    {!imgSrc ? (
                        <button className="dys-btn-primary" onClick={capture}>Scan Person</button>
                    ) : (
                        <button className="dys-btn-primary" onClick={() => { setImgSrc(null); setResults([]); setStatus(""); }}>Scan Again</button>
                    )}
                </div>

                {status && <p className="dys-status-msg">{status}</p>}
                
                {results.length > 0 && (
                    <div className="dys-result-box">
                        <h3 className="dys-result-title">Recognition Results</h3>
                        {results.map((name, i) => (
                            <div key={i} className="dys-result-item">
                                👤 {name}
                            </div>
                        ))}
                    </div>
                )}
                    
            </main>
        </div>
    );
};
export default Identify;
