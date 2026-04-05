import { useEffect, useRef, useState } from 'react';
import type { Customer } from '@features/customers/types';
import styles from './CustomerSelector.module.scss';

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

type Props = {
  customers: Customer[];
  loading:   boolean;
  value:     Customer | null;
  onChange:  (c: Customer) => void;
  error?:    string;
}

export const CustomerSelector = ({ customers, loading, value, onChange, error }: Props) => {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => setSearch(''));
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  const subLabel = (c: Customer) => c.email ?? c.phone ?? '';

  return (
    <div className={styles.wrapper} ref={wrapRef}>
      <button
        type="button"
        className={[styles.trigger, open ? styles.open : '', error ? styles.hasError : ''].filter(Boolean).join(' ')}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className={styles.triggerContent}>
          {value ? (
            <>
              <div className={styles.avatar}>{initials(value.name)}</div>
              <div className={styles.selectedInfo}>
                <span className={styles.selectedName}>{value.name}</span>
                {subLabel(value) && <span className={styles.selectedSub}>{subLabel(value)}</span>}
              </div>
            </>
          ) : (
            <span className={styles.placeholder}>Select a customer…</span>
          )}
        </div>
        <span className={`${styles.chevron} ${open ? styles.rotated : ''}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              ref={searchRef}
              className={styles.searchInput}
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
            />
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className={styles.loadingRow}>Loading customers…</div>
            ) : filtered.length === 0 ? (
              <div className={styles.noResults}>No customers found</div>
            ) : (
              filtered.map((c) => (
                <div
                  key={c.id}
                  role="option"
                  aria-selected={value?.id === c.id}
                  className={`${styles.item} ${value?.id === c.id ? styles.selected : ''}`}
                  onClick={() => { onChange(c); setOpen(false); }}
                >
                  <div className={styles.itemLeft}>
                    <div className={styles.avatar}>{initials(c.name)}</div>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{c.name}</span>
                      {subLabel(c) && <span className={styles.itemSub}>{subLabel(c)}</span>}
                    </div>
                  </div>
                  {value?.id === c.id && (
                    <span className={styles.checkIcon}>
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
