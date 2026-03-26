import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import Landing from "./landing";
import Auth from "./Auth.jsx";
import Hero from "./hero";

export default function App() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState("landing");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    // If logged in → go to hero
    if (user) {
        return <Hero user={user} />;
    }

    // Navigation
    if (page === "auth") {
        return <Auth />;
    }

    return <Landing goToAuth={() => setPage("auth")} />;
}