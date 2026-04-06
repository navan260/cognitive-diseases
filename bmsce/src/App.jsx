import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { LanguageProvider } from "./LanguageContext";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

import Landing from "./landing";
import Auth from "./Auth.jsx";
import Hero from "./hero";
import Header from "./components/Header";

// Import Dyslexia Pages
import DyslexiaHome from "./dyslexia/pages/Home";
import DyslexiaLive from "./dyslexia/pages/Live";
import DyslexiaUpload from "./dyslexia/pages/Upload";
import DyslexiaPdfUpload from "./dyslexia/pages/PdfUpload";

// Import Dycalculia Pages
import DycalculiaHome from "./dycalculia/pages/Home";
import DycalculiaSmartTest from "./dycalculia/features/smartTest/tests/SmartTest";

// Import Propognasia Pages
import PropognasiaHome from "./propognasia/pages/Home";
import PropognasiaEnroll from "./propognasia/pages/Enroll";
import PropognasiaIdentify from "./propognasia/pages/Identify";

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            
            // If user logs in while on /auth, move to dashboard
            if (currentUser && window.location.pathname === "/auth") {
                navigate("/dashboard", { replace: true });
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                backgroundColor: "#020411",
                color: "#fff",
                fontSize: "1.2rem"
            }}>
                Loading...
            </div>
        );
    }

    return (
        <LanguageProvider>
            <Header user={user} />
            <Routes>
                {/* Main Routing */}
                <Route path="/" element={<Landing user={user} />} />
                <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
                <Route path="/dashboard" element={user ? <Hero user={user} /> : <Navigate to="/auth" replace />} />
                
                {/* Dyslexia Routes */}
                <Route path="/dyslexia" element={<DyslexiaHome />} />
                <Route path="/dyslexia/live" element={<DyslexiaLive />} />
                <Route path="/dyslexia/upload" element={<DyslexiaUpload />} />
                <Route path="/dyslexia/pdf-upload" element={<DyslexiaPdfUpload />} />
                
                {/* Dycalculia Routes */}
                <Route path="/dycalculia" element={<DycalculiaHome />} />
                <Route path="/dycalculia/test/:testType" element={<DycalculiaSmartTest />} />
                
                {/* Propognasia Routes */}
                <Route path="/propognasia" element={<PropognasiaHome />} />
                <Route path="/propognasia/enroll" element={<PropognasiaEnroll />} />
                <Route path="/propognasia/identify" element={<PropognasiaIdentify />} />
            </Routes>
        </LanguageProvider>
    );
}