import React from 'react';

interface VendixLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  badgeText?: string;
}

export const VendixLogo: React.FC<VendixLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  badgeText = 'POS SaaS'
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', badge: 'text-[8px] px-1.5 py-0.5' },
    md: { icon: 'w-11 h-11', text: 'text-xl', badge: 'text-[9px] px-2 py-0.5' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl', badge: 'text-xs px-2.5 py-1' },
    xl: { icon: 'w-24 h-24', text: 'text-4xl', badge: 'text-xs px-3 py-1' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* ISOTIPO GEOMÉTRICO ULTRA-PROFESIONAL "V" (Nivel Apple / Stripe / Linear) */}
      <div className={`relative ${currentSize.icon} flex items-center justify-center shrink-0`}>
        {/* Resplandor hiper-realista de fondo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 rounded-2xl blur-lg opacity-50 animate-pulse pointer-events-none" />
        
        {/* SVG Isotipo de Alta Gama */}
        <svg
          viewBox="0 0 120 120"
          className="relative w-full h-full drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradiente Primario: Indigo a Cyan */}
            <linearGradient id="vendixPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="60%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Gradiente Secundario: Cyan a Esmeralda */}
            <linearGradient id="vendixAccent" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>

            {/* Gradiente de Borde de Tarjeta */}
            <linearGradient id="vendixBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#C084FC" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.8" />
            </linearGradient>

            {/* Sombra suave interna */}
            <filter id="vShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Contenedor Base Hexagonal / Cuadrado Redondeado 3D */}
          <rect width="120" height="120" rx="32" fill="#090D16" />
          <rect width="118" height="118" x="1" y="1" rx="31" stroke="url(#vendixBorder)" strokeWidth="2.5" />

          {/* Malla sutil de fondo */}
          <circle cx="60" cy="60" r="42" fill="url(#vendixPrimary)" fillOpacity="0.08" />

          {/* ISOTIPO MONOGRAMA V: Faceta Izquierda Cóncava (Base V) */}
          <path
            d="M 28 32 L 56 86 C 58 90 62 90 64 86 L 92 32 C 94 28 90 24 85 26 L 60 40 L 35 26 C 30 24 26 28 28 32 Z"
            fill="url(#vendixPrimary)"
            filter="url(#vShadow)"
          />

          {/* ISOTIPO MONOGRAMA V: Vórtice Diamante Central (Gráfico de Crecimiento & Check) */}
          <path
            d="M 60 44 L 82 24 C 84 22 88 24 87 27 L 65 72 C 63 76 57 76 55 72 L 40 50 C 38 47 41 44 44 46 L 57 56 L 76 28 L 60 44 Z"
            fill="url(#vendixAccent)"
          />

          {/* Destello Central Blanco de Alta Precisión */}
          <path
            d="M 60 44 L 74 30 L 63 60 L 56 48 Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
        </svg>
      </div>

      {/* TEXTO DE MARCA VENDIX */}
      {showText && (
        <div className="flex flex-col items-start leading-none">
          <div className="flex items-center gap-2">
            <span className={`${currentSize.text} font-black tracking-widest text-white font-heading`}>
              VENDIX
            </span>
            {badgeText && (
              <span className={`${currentSize.badge} rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-indigo-400/30 text-cyan-300 font-extrabold uppercase tracking-widest shadow-xs`}>
                {badgeText}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
