import { useEffect } from 'react';

interface KeyboardHandlers {
  onF1Search?: () => void;
  onF2Customer?: () => void;
  onF3Scan?: () => void;
  onF4Customer?: () => void;
  onF5Suspend?: () => void;
  onF7Discount?: () => void;
  onF8Drawer?: () => void;
  onEnterCheckout?: () => void;
}

export const useKeyboardShortcuts = (handlers: KeyboardHandlers) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Interceptar teclas F1-F8 y Enter para prevenir comportamientos por defecto del navegador (Ayuda, Búsqueda, Recargar)
      if (['F1', 'F2', 'F3', 'F4', 'F5', 'F7', 'F8'].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
      }

      switch (event.key) {
        case 'F1':
          handlers.onF1Search?.();
          break;
        case 'F2':
          handlers.onF2Customer?.();
          break;
        case 'F3':
          handlers.onF3Scan?.();
          break;
        case 'F4':
          handlers.onF4Customer?.();
          break;
        case 'F5':
          handlers.onF5Suspend?.();
          break;
        case 'F7':
          handlers.onF7Discount?.();
          break;
        case 'F8':
          handlers.onF8Drawer?.();
          break;
        case 'Enter':
          // Solo si el usuario no está dentro de un textarea o input de texto normal
          if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            event.preventDefault();
            handlers.onEnterCheckout?.();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handlers]);
};
