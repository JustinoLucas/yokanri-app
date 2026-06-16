import { createContext, useContext, useState, useCallback } from 'react';
import { getT, LANGUAGES } from './strings';
import * as onboardingService from '../onboarding/services/onboardingService';

const LanguageContext = createContext(null);

export function LanguageProvider({ initialLanguage = 'pt-BR', children }) {
  const [language, setLanguageState] = useState(initialLanguage);

  const setLanguage = useCallback(async (lang) => {
    setLanguageState(lang);
    try {
      await onboardingService.saveLanguage(lang);
    } catch {
      // salvo em memória, persiste na próxima escrita
    }
  }, []);

  const t = useCallback(getT(language), [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
