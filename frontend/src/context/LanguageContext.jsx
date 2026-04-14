import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('system-language') || 'en-IN';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        if (language === 'hi-IN') {
            root.classList.add('font-hindi');
        } else {
            root.classList.remove('font-hindi');
        }

        i18n.changeLanguage(language);
        localStorage.setItem('system-language', language);
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
