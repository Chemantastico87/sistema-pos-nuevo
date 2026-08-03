import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES, LanguageCode } from '../../core/store/languageStore';

interface LanguageSelectorProps {
  variant?: 'dark' | 'light';
  showLabel?: boolean;
  direction?: 'down' | 'up';
  align?: 'left' | 'right' | 'center';
  displayStyle?: 'dropdown' | 'pills';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dark',
  showLabel = true,
  direction = 'down',
  align = 'left',
  displayStyle = 'dropdown',
}) => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLight = variant === 'light';

  // Si displayStyle es 'pills', renderiza los botones planos con las banderas directas sin desbordamiento
  if (displayStyle === 'pills') {
    return (
      <div className="flex items-center gap-1.5 flex-wrap font-sans">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = lang.code === language;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code as LanguageCode)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md border border-indigo-400/40'
                  : isLight
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
              title={lang.name}
            >
              <span className="text-sm leading-none">{lang.flag}</span>
              <span className="uppercase text-[11px] font-extrabold">{lang.code}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Clases de alineación horizontal para prevenir que se desplace a la izquierda o fuera de pantalla
  const alignClass = align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0';
  const verticalClass = direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    <div className="relative inline-block text-left font-sans z-50" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-xs ${
          isLight
            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-indigo-500/60'
        }`}
      >
        <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="text-sm leading-none">{activeOption.flag}</span>
        {showLabel && <span className="uppercase tracking-wider">{activeOption.code}</span>}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${alignClass} ${verticalClass} w-48 rounded-2xl border shadow-2xl py-1.5 z-[999] animate-scaleIn ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50'
              : 'bg-slate-900 border-slate-700 text-slate-200 backdrop-blur-xl'
          }`}
        >
          <div className="px-3 py-1.5 border-b border-slate-700/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Seleccionar Idioma / Language
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code as LanguageCode);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-400 font-extrabold'
                    : isLight
                    ? 'hover:bg-slate-100 text-slate-700'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
