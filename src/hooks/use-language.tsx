"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserPreferencesAction, saveUserPreferencesAction } from '@/lib/actions';
import en from '@/locales/en.json';

// Static locale registry — add new languages here
const locales: Record<string, Record<string, string>> = { en };

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>(en);

  useEffect(() => {
    void (async () => {
      try {
        const remote = await getUserPreferencesAction();
        if (remote.data?.language) {
          setLanguage(remote.data.language);
          return;
        }
      } catch {
        // Server action failed — fall through to localStorage
      }

      const storedLanguage = window.localStorage.getItem('kisan-alert.language');
      if (storedLanguage) {
        setLanguage(storedLanguage);
      }
    })();
  }, []);

  useEffect(() => {
    if (locales[language]) {
      setTranslations(locales[language]);
    }
    // TODO: dynamically import other locales when added
  }, [language]);

  const t = (key: string, options?: Record<string, string | number>): string => {
    let translation = translations[key] || key;
    if (options) {
      Object.keys(options).forEach(placeholder => {
        translation = translation.replace(`{{${placeholder}}}`, String(options[placeholder]));
      });
    }
    return translation;
  };

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    window.localStorage.setItem('kisan-alert.language', lang);
    void saveUserPreferencesAction({ language: lang });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
