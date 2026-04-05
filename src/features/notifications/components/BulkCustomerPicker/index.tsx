import { useRef, useState } from 'react';
import type { Customer } from '@features/customers/types';
import styles from './BulkCustomerPicker.module.scss';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

export type PickerProps = {
  customers: Customer[];
  loading: boolean;
  selected: Customer[];
  onChange: (customers: Customer[]) => void;
  error?: string;
};

export const BulkCustomerPicker = ({
  customers,
  loading,
  selected,
  onChange,
  error,
}: PickerProps) => {
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedIds = new Set(selected.map((c) => c.id));

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    );
  });

  const toggle = (customer: Customer) => {
    if (selectedIds.has(customer.id)) {
      onChange(selected.filter((c) => c.id !== customer.id));
    } else {
      onChange([...selected, customer]);
    }
  };

  const toggleAll = () => {
    onChange(selected.length === customers.length ? [] : [...customers]);
  };

  const subLabel = (c: Customer) => c.email ?? c.phone ?? '';

  return (
    <div className={styles.picker}>
      <div className={`${styles.pickerHeader} ${error ? styles.hasError : ''}`}>
        <div className={styles.pickerSearch}>
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
          <input
            ref={searchRef}
            className={styles.pickerSearchInput}
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {customers.length > 0 && (
          <button
            type="button"
            className={styles.selectAllBtn}
            onClick={toggleAll}
          >
            {selected.length === customers.length
              ? 'Deselect all'
              : 'Select all'}
          </button>
        )}
      </div>

      <div className={styles.pickerList}>
        {loading ? (
          <div className={styles.pickerEmpty}>Loading customers…</div>
        ) : filtered.length === 0 ? (
          <div className={styles.pickerEmpty}>No customers found</div>
        ) : (
          filtered.map((c) => {
            const checked = selectedIds.has(c.id);
            return (
              <label
                key={c.id}
                className={`${styles.pickerItem} ${checked ? styles.checked : ''}`}
              >
                <input
                  type="checkbox"
                  className={styles.pickerCheckbox}
                  checked={checked}
                  onChange={() => toggle(c)}
                />
                <div className={styles.pickerAvatar}>{initials(c.name)}</div>
                <div className={styles.pickerInfo}>
                  <span className={styles.pickerName}>{c.name}</span>
                  {subLabel(c) && (
                    <span className={styles.pickerSub}>{subLabel(c)}</span>
                  )}
                </div>
              </label>
            );
          })
        )}
      </div>

      {selected.length > 0 && (
        <div className={styles.chipRow}>
          {selected.map((c) => (
            <span key={c.id} className={styles.chip}>
              {c.name}
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => toggle(c)}
                aria-label={`Remove ${c.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
