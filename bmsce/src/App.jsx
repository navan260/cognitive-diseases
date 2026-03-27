import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { LanguageProvider } from "./LanguageContext";

import Landing from "./landing";
import Auth from "./Auth.jsx";
import Hero from "./hero";

export default function App() {
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
            <LanguageProvider>
                <Hero user={user} />
            </LanguageProvider>
        );
    }

    // Navigation
    if (page === "auth") {
        return (
            <LanguageProvider>
                <Auth setPage={setPage} />
            </LanguageProvider>
        );
    }

    return (
        <LanguageProvider>
            <Landing goToAuth={() => setPage("auth")} />
        </LanguageProvider>
    );
}