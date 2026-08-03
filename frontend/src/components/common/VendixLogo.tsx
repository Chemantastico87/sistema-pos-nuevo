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
  badgeText = 'POS Commercial'
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', badge: 'text-[8px] px-1.5 py-0.5' },
    md: { icon: 'w-11 h-11', text: 'text-xl', badge: 'text-[9px] px-2 py-0.5' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl', badge: 'text-xs px-2.5 py-1' },
    xl: { icon: 'w-24 h-24', text: 'text-4xl', badge: 'text-xs px-3 py-1' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
      {/* EMBLEMA MONOGRAMA VENDIX ULTRA-MODERNO (ESTILO LINEAR / STRIPE / VERCEL) */}
      <div className={`relative ${currentSize.icon} flex items-center justify-center shrink-0`}>
        {/* HALO LUMINOSO DE AMBIENTE */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-400 rounded-2xl blur-lg opacity-60 animate-pulse pointer-events-none" />
        
        {/* SVG ISOTIPO DE ALTA PRECISION */}
        <svg
          viewBox="0 0 100 100"
          className="relative w-full h-full drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradientes de Graduación Metálica */}
            <linearGradient id="vxGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#3730A3" />
            </linearGradient>

            <linearGradient id="vxGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            <linearGradient id="vxGradCenter" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>

            <linearGradient id="vxBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* BASE DE CRISTAL OSCURO (SLATE 950) */}
          <rect width="100" height="100" rx="28" fill="#0A0F1D" />
          <rect width="98" height="98" x="1" y="1" rx="27" stroke="url(#vxBorder)" strokeWidth="2" strokeOpacity="0.5" />

          {/* ALAS Y VECTOR DE LA V ABSTRACTA EN PRISMA 3D */}
          {/* Brazo Izquierdo V */}
          <path
            d="M 22 24 L 48 76 C 50 80 54 80 56 76 L 68 52 L 48 24 Z"
            fill="url(#vxGradLeft)"
          />

          {/* Brazo Derecho V + Flecha Ascendente */}
          <path
            d="M 78 24 L 52 76 C 50 80 46 80 44 76 L 32 52 L 52 24 Z"
            fill="url(#vxGradRight)"
            style={{ mixBlendMode: 'screen' }}
          />

          {/* Vórtice Diamante Central (Punto Focal de Éxito) */}
          <path
            d="M 50 20 L 78 50 L 50 80 L 22 50 Z"
            fill="url(#vxGradCenter)"
            fillOpacity="0.45"
          />

          {/* Núcleo Flotante Vectorial en Cristal Blanco */}
          <circle cx="50" cy="50" r="10" fill="#FFFFFF" fillOpacity="0.9" />
          <path d="M 45 50 L 49 54 L 56 46" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* TEXTO Y LOGOTIPO DE MARCA */}
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
