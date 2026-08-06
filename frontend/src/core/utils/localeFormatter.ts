import { LanguageCode } from '../../locales';

/**
 * Mapeo de códigos de idioma VENDIX a BCP 47 para la API Intl de JavaScript
 */
const LOCALE_MAP: Record<LanguageCode, string> = {
  es: 'es-ES',
  en: 'en-US',
};

/**
 * Formatea una fecha según el idioma activo manteniendo estándares culturales
 * Ejemplo: es -> 31/12/2026, en -> 12/31/2026, pt -> 31/12/2026
 */
export const formatDate = (
  date: Date | string | number,
  lang: LanguageCode = 'es',
  options?: Intl.DateTimeFormatOptions
): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  };

  const bcp47 = LOCALE_MAP[lang] || 'es-ES';
  return new Intl.DateTimeFormat(bcp47, defaultOptions).format(d);
};

/**
 * Formatea la hora según el idioma activo
 */
export const formatTime = (
  date: Date | string | number,
  lang: LanguageCode = 'es',
  options?: Intl.DateTimeFormatOptions
): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options,
  };

  const bcp47 = LOCALE_MAP[lang] || 'es-ES';
  return new Intl.DateTimeFormat(bcp47, defaultOptions).format(d);
};

/**
 * Formatea números (separador de miles y decimales) según el idioma activo
 */
export const formatNumber = (
  value: number,
  lang: LanguageCode = 'es',
  minimumFractionDigits: number = 2
): string => {
  if (isNaN(value)) return '0.00';

  const bcp47 = LOCALE_MAP[lang] || 'es-ES';
  return new Intl.NumberFormat(bcp47, {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  }).format(value);
};
