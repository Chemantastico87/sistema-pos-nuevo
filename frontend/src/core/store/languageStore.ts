import { create } from 'zustand';
import { type LanguageCode, type LanguageOption, SUPPORTED_LANGUAGES, resolveTranslation } from '../../locales';

export type { LanguageCode, LanguageOption };
export { SUPPORTED_LANGUAGES };

interface LanguageState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const detectBrowserLanguage = (): LanguageCode => {
  const stored = localStorage.getItem('vendix_lang') as LanguageCode;
  if (stored && ['es', 'en'].includes(stored)) {
    return stored;
  }

  // Cookie fallback
  const match = typeof document !== 'undefined' ? document.cookie.match(/(?:^|; )vendix_lang=([^;]*)/) : null;
  if (match && ['es', 'en'].includes(match[1])) {
    return match[1] as LanguageCode;
  }

  // Browser language auto-detection
  const browserLang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language.split('-')[0].toLowerCase() : 'es';
  if (['es', 'en'].includes(browserLang)) {
    return browserLang as LanguageCode;
  }

  return 'es';
};

const initialLang = detectBrowserLanguage();

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: initialLang,
  setLanguage: (lang) => {
    localStorage.setItem('vendix_lang', lang);
    if (typeof document !== 'undefined') {
      document.cookie = `vendix_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    }
    set({ language: lang });
  },
  t: (key, params) => {
    const currentLang = get().language || 'es';
    return resolveTranslation(currentLang, key, params);
  },
}));

export const useTranslation = () => {
  const { language, setLanguage, t } = useLanguageStore();
  return { t, language, setLanguage };
};
