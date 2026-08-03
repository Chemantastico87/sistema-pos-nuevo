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
    sm: { icon: 'w-6 h-6', text: 'text-lg', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { icon: 'w-10 h-10', text: 'text-2xl', badge: 'text-[10px] px-2 py-0.5' },
    lg: { icon: 'w-14 h-14', text: 'text-3xl', badge: 'text-xs px-2.5 py-1' },
    xl: { icon: 'w-20 h-20', text: 'text-4xl', badge: 'text-xs px-3 py-1' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* ISOTIPO GEOMÉTRICO "V" ABSTRACTO */}
      <div className={`relative ${currentSize.icon} flex items-center justify-center shrink-0`}>
        {/* Resplandor ambiental de fondo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-400 rounded-2xl blur-md opacity-60 animate-pulse" />
        
        {/* SVG Isotipo de Precisión V */}
        <svg
          viewBox="0 0 100 100"
          className="relative w-full h-full drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vendixGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="vendixGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
          </defs>

          {/* Fondo de tarjeta oscura estilizada */}
          <rect width="100" height="100" rx="26" fill="#0F172A" />
          <rect width="98" height="98" x="1" y="1" rx="25" stroke="url(#vendixGrad1)" strokeWidth="2" strokeOpacity="0.4" />

          {/* Brazo Izquierdo de la V (Caja 3D / Check descendente) */}
          <path
            d="M 24 26 L 46 68 L 34 76 L 16 38 Z"
            fill="url(#vendixGrad1)"
          />

          {/* Brazo Derecho de la V (Gráfico ascendente de éxito) */}
          <path
            d="M 42 74 L 80 22 L 68 16 L 34 62 Z"
            fill="url(#vendixGrad2)"
          />

          {/* Vórtice central del Isotipo (Check / Cubo Abierto) */}
          <path
            d="M 44 64 L 56 64 L 78 28 L 68 28 Z"
            fill="#FFFFFF"
            fillOpacity="0.9"
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
              <span className={`${currentSize.badge} rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-indigo-500/30 text-cyan-300 font-extrabold uppercase tracking-widest`}>
                {badgeText}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
