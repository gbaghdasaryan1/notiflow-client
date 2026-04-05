import { createPortal } from 'react-dom';
import styles from './Toast.module.scss';

type ToastProps = {
  toast: { message: string; kind: 'success' | 'error' } | null;
  onDismiss?: () => void;
};

export const Toast = ({ toast, onDismiss }: ToastProps) => {
  if (!toast) return null;

  return createPortal(
    <div className={styles.portal}>
      <div className={`${styles.toast} ${styles[toast.kind]}`} role="status">
        <span className={styles.icon}>
          {toast.kind === 'success' ? '✓' : '⚠'}
        </span>
        <span className={styles.message}>{toast.message}</span>
        {onDismiss && (
          <button
            className={styles.dismissBtn}
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};
