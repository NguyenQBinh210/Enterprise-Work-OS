'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, dictionaries } from './dictionaries';

type LanguageContextType = {
    locale: Locale;
    t: (key: string) => string;
    setLocale: (locale: Locale) => void;
    dictionary: typeof dictionaries['en'];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState<Locale>('en');

    // Load from localStorage if available
    useEffect(() => {
        const savedLocale = localStorage.getItem('app-locale') as Locale;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'vi')) {
            setLocale(savedLocale);
        }
    }, []);

    const changeLocale = (newLocale: Locale) => {
        setLocale(newLocale);
        localStorage.setItem('app-locale', newLocale);
    };

    const dictionary = dictionaries[locale];

    // Helper to get nested keys like 'common.dashboard'
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = dictionary;
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, t, setLocale: changeLocale, dictionary }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
