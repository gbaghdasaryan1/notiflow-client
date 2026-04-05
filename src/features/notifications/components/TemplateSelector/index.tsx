/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react';
import styles from './TemplateSelector.module.scss';
import type { Template } from '@features/templates';

const EmailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
    <rect
      x="1"
      y="3"
      width="12"
      height="8"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M1 4.5l5.47 3.8a1 1 0 001.06 0L13 4.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const SmsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H4.5L2 12V3a1 1 0 011-1z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

type Props = {
  templates: Template[];
  loading: boolean;
  value: Template | null;
  onChange: (t: Template) => void;
  error?: string;
};

export const TemplateSelector = ({
  templates,
  loading,
  value,
  onChange,
  error,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setSearch('');
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.wrapper} ref={wrapRef}>
      <button
        type="button"
        className={[
          styles.trigger,
          open ? styles.open : '',
          error ? styles.hasError : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className={styles.triggerContent}>
          {value ? (
            <>
              <div className={`${styles.itemIcon} ${styles[value.channel]}`}>
                {value.channel === 'email' ? <EmailIcon /> : <SmsIcon />}
              </div>
              <span className={styles.selectedName}>{value.name}</span>
              <span
                className={`${styles.channelBadge} ${styles[value.channel]}`}
              >
                {value.channel === 'email' ? 'Email' : 'SMS'}
              </span>
            </>
          ) : (
            <span className={styles.placeholder}>Select a template…</span>
          )}
        </div>
        <span className={`${styles.chevron} ${open ? styles.rotated : ''}`}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <circle
                  cx="6"
                  cy="6"
                  r="4.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M9.5 9.5L13 13"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              ref={searchRef}
              className={styles.searchInput}
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
              }}
            />
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className={styles.loadingRow}>Loading templates…</div>
            ) : filtered.length === 0 ? (
              <div className={styles.noResults}>No templates found</div>
            ) : (
              filtered.map((t) => (
                <div
                  key={t.id}
                  role="option"
                  aria-selected={value?.id === t.id}
                  className={`${styles.item} ${value?.id === t.id ? styles.selected : ''}`}
                  onClick={() => {
                    onChange(t);
                    setOpen(false);
                  }}
                >
                  <div className={styles.itemLeft}>
                    <div className={`${styles.itemIcon} ${styles[t.channel]}`}>
                      {t.channel === 'email' ? <EmailIcon /> : <SmsIcon />}
                    </div>
                    <span className={styles.itemName}>{t.name}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span
                      className={`${styles.channelBadge} ${styles[t.channel]}`}
                    >
                      {t.channel === 'email' ? 'Email' : 'SMS'}
                    </span>
                    {value?.id === t.id && (
                      <span className={styles.checkIcon}>
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M2 7l4 4 6-6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
