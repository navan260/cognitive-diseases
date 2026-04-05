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
            
            const res = await fetch("http://127.0.0.1:5000/propognasia/identify", {
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
            <nav className="dash-nav">
                <div className="dash-nav-left" onClick={() => navigate("/propognasia")}>
                    <div className="dash-brand">
                        <span className="dash-brand-name">← Back</span>
                    </div>
                </div>
            </nav>
            <main className="dys-main" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <h1 className="dys-title">Identify Face</h1>
                
                <div style={{marginBottom: '20px'}}>
                    {!imgSrc ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "user" }}
                            style={{ borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px' }}
                        />
                    ) : (
                        <img src={imgSrc} alt="captured" style={{ borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px' }} />
                    )}
                </div>
                
                <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
                    {!imgSrc ? (
                        <button className="dys-btn-primary" onClick={capture}>Scan Person</button>
                    ) : (
                        <button className="dys-btn-primary" onClick={() => { setImgSrc(null); setResults([]); setStatus(""); }}>Scan Again</button>
                    )}
                </div>

                {status && <p style={{marginTop: '10px', color: '#fff', fontSize: '18px'}}>{status}</p>}
                
                {results.length > 0 && (
                    <div style={{marginTop: '20px', background: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '10px', width: '100%', maxWidth: '400px'}}>
                        <h3 style={{color: '#fff', marginBottom: '10px', textAlign: 'center'}}>Recognition Results</h3>
                        {results.map((name, i) => (
                            <div key={i} style={{color: '#4ade80', fontSize: '20px', fontWeight: 'bold', textAlign: 'center', margin: '5px 0'}}>
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
