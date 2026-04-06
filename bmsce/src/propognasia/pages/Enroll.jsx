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

const Enroll = () => {
    const webcamRef = useRef(null);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [status, setStatus] = useState("");
    const [imgSrc, setImgSrc] = useState(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribeAuth();
    }, []);

    const capture = React.useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef]);

    const handleEnroll = async () => {
        if (!user) {
            setStatus("Please log in first!");
            return;
        }
        if (!name.trim()) {
            setStatus("Please enter a name!");
            return;
        }
        if (!imgSrc) {
            setStatus("Please capture a photo!");
            return;
        }
        
        setStatus("Enrolling face...");
        
        try {
            const blob = dataURItoBlob(imgSrc);
            const formData = new FormData();
            formData.append("file", blob, "capture.jpg");
            formData.append("name", name);
            formData.append("userId", user.uid);
            
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/propognasia/enroll`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            
            if (data.success) {
                setStatus(`Success! Enrolled ${name}`);
                setImgSrc(null);
                setName("");
            } else {
                setStatus(`Error: ${data.error}`);
            }
        } catch (error) {
            setStatus(`Failed to connect to server: ${error.message}`);
        }
    };

    return (
        <div className="dyslexia-wrapper">
            <div className="snow-background"></div>

            <main className="dys-main" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <h1 className="dys-title">Enroll Face</h1>
                
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
                        <button className="dys-btn-primary" onClick={capture}>Capture Photo</button>
                    ) : (
                        <button className="dys-btn-primary" onClick={() => setImgSrc(null)}>Retake</button>
                    )}
                </div>

                <div className="dys-input-group">
                    <input 
                        type="text" 
                        placeholder="Enter person's name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="dys-input"
                    />
                    <button className="dys-btn-primary" onClick={handleEnroll} disabled={!imgSrc}>Save Face</button>
                </div>
                
                {status && <p className="dys-status-msg">{status}</p>}
                    
            </main>
        </div>
    );
};
export default Enroll;
