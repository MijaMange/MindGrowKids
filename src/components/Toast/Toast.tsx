import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import './Toast.css';

interface ToastProps {
  message: string | null;
  onHide: () => void;
  durationMs?: number;
  /** When true, toast stays visible until parent clears message (e.g. on navigate). */
  persist?: boolean;
}

/**
 * Toast – fixed bottom-center, Portal to body so it is never clipped.
 * When persist is false: visible for durationMs then onHide().
 * When persist is true: stays until message is set to null by parent.
 */
export function Toast({ message, onHide, durationMs = 2200, persist = false }: ToastProps) {
  useEffect(() => {
    if (!message || persist) return;
    if (typeof window !== 'undefined') {
      console.log('[FEEDBACK TRIGGERED]', message);
    }
    const t = setTimeout(() => {
      onHide();
    }, durationMs);
    return () => clearTimeout(t);
  }, [message, onHide, durationMs, persist]);

  if (!message) return null;

  const content = (
    <div className="mg-toast" role="status" aria-live="polite">
      {message}
    </div>
  );

  return createPortal(content, document.body);
}
