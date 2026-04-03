import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { LanguageProvider } from "./LanguageContext";
import { Routes, Route } from "react-router-dom";

import Landing from "./landing";
import Auth from "./Auth.jsx";
import Hero from "./hero";

// Import Dyslexia Pages
import DyslexiaHome from "./dyslexia/pages/Home";
import DyslexiaLive from "./dyslexia/pages/Live";
import DyslexiaUpload from "./dyslexia/pages/Upload";
import DyslexiaPdfUpload from "./dyslexia/pages/PdfUpload";

// Import Dycalculia Pages
import DycalculiaHome from "./dycalculia/pages/Home";
import DycalculiaSmartTest from "./dycalculia/features/smartTest/tests/SmartTest";

function MainApp() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState("landing");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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

    // If logged in → go to hero
    if (user) {
        return (
            <Hero user={user} />
        );
    }

    // Navigation
    if (page === "auth") {
        return (
            <Auth setPage={setPage} />
        );
    }

    return (
        <Landing goToAuth={() => setPage("auth")} />
    );
}

export default function App() {
    return (
        <LanguageProvider>
            <Routes>
                <Route path="/" element={<MainApp />} />
                
                {/* Dyslexia Routes */}
                <Route path="/dyslexia" element={<DyslexiaHome />} />
                <Route path="/dyslexia/live" element={<DyslexiaLive />} />
                <Route path="/dyslexia/upload" element={<DyslexiaUpload />} />
                <Route path="/dyslexia/pdf-upload" element={<DyslexiaPdfUpload />} />
                
                {/* Dycalculia Routes */}
                <Route path="/dycalculia" element={<DycalculiaHome />} />
                <Route path="/dycalculia/test/:testType" element={<DycalculiaSmartTest />} />
            </Routes>
        </LanguageProvider>
    );
}