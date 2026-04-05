import { useState, useRef, useCallback } from 'react';

type ToastKind = 'success' | 'error';
type ToastState = { message: string; kind: ToastKind } | null;

export function useToast(duration = 4000) {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, kind: ToastKind) => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, kind });
      timer.current = setTimeout(() => setToast(null), duration);
    },
    [duration]
  );

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  return { toast, show, dismiss } as const;
}
