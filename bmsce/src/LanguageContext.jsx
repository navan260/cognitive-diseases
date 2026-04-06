import React, { createContext, useState, useContext } from "react";
import { getTranslation } from "./translations";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("cognitive_platform_language") || "en";
    });

    const [isDyslexicFont, setIsDyslexicFont] = useState(() => {
        return localStorage.getItem("isDyslexicFont") === "true";
    });

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem("cognitive_platform_language", lang);
    };

    const toggleDyslexicFont = () => {
        const newState = !isDyslexicFont;
        setIsDyslexicFont(newState);
        localStorage.setItem("isDyslexicFont", newState);
    };

    React.useEffect(() => {
        if (isDyslexicFont) {
            document.documentElement.classList.add("opendyslexic-font");
        } else {
            document.documentElement.classList.remove("opendyslexic-font");
        }
    }, [isDyslexicFont]);

    const t = (key) => getTranslation(language, key);

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, isDyslexicFont, toggleDyslexicFont }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }
    return context;
};
