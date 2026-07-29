import { useEffect } from 'react';

interface KeyboardHandlers {
  onF1Search?: () => void;
  onF2Customer?: () => void;
  onF3Discount?: () => void;
  onF4Checkout?: () => void;
  onF5NewTicket?: () => void;
}

export const useKeyboardShortcuts = (handlers: KeyboardHandlers) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'F1':
          event.preventDefault();
          handlers.onF1Search?.();
          break;
        case 'F2':
          event.preventDefault();
          handlers.onF2Customer?.();
          break;
        case 'F3':
          event.preventDefault();
          handlers.onF3Discount?.();
          break;
        case 'F4':
          event.preventDefault();
          handlers.onF4Checkout?.();
          break;
        case 'F5':
          event.preventDefault();
          handlers.onF5NewTicket?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};
