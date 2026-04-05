import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import styles from './Modal.module.scss';
import Button from '@/shared/components/ui/Button';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  formId: string;
  submitting: boolean;
  submitLabel: string;
  apiError?: string;
  maxWidth?: 'sm' | 'md' | 'lg';
  children: ReactNode;
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  formId,
  submitting,
  submitLabel,
  apiError,
  maxWidth = 'md',
  children,
}: ModalProps) => {
  const titleId = useId();

  // Close on Escape (blocked while submitting)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, submitting, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        className={`${styles.dialog} ${styles[maxWidth]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span id={titleId} className={styles.title}>
              {title}
            </span>
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
            {badge && <span className={styles.badge}>{badge}</span>}
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
            disabled={submitting}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {apiError && (
            <div className={styles.apiError} role="alert">
              <em style={{ fontStyle: 'normal' }}>⚠</em>
              {apiError}
            </div>
          )}
          {children}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} size="sm" loading={submitting}>
            {submitting ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
