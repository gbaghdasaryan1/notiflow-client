import type { Customer } from '@features/customers/types';
import styles from './CustomerTable.module.scss';
import { initials, tagStyle } from '@features/customers/helpers';
import { SkeletonRows } from '../Skeleton';

// ── Props ─────────────────────────────────────────────────────────────────────
type Props = {
  customers: Customer[];
  loading: boolean;
  onDelete: (id: string) => void;
  deletingId: string | null;
};

export const CustomerTable = ({
  customers,
  loading,
  onDelete,
  deletingId,
}: Props) => (
  <div className={styles.tableWrapper}>
    <table>
      <thead className={styles.thead}>
        <tr>
          <th>Customer</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Tags</th>
          <th />
        </tr>
      </thead>

      <tbody className={styles.tbody}>
        {loading ? (
          <SkeletonRows />
        ) : customers.length === 0 ? (
          <tr>
            <td colSpan={5}>
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>👥</div>
                <div className={styles.emptyTitle}>No customers yet</div>
                <div className={styles.emptyText}>
                  Add your first customer to get started.
                </div>
              </div>
            </td>
          </tr>
        ) : (
          customers.map((c) => (
            <tr key={c.id}>
              <td data-label="Customer">
                <div className={styles.nameCell}>
                  <div className={styles.avatar}>{initials(c.name)}</div>
                  <span className={styles.name}>{c.name}</span>
                </div>
              </td>

              <td className={styles.muted} data-label="Email">
                {c.email ?? '—'}
              </td>
              <td className={styles.muted} data-label="Phone">
                {c.phone ?? '—'}
              </td>

              <td data-label="Tags">
                {c.tags && c.tags.length > 0 ? (
                  <div className={styles.tags}>
                    {c.tags.map((tag) => {
                      const s = tagStyle(tag);
                      return (
                        <span
                          key={tag}
                          className={styles.tag}
                          style={{
                            background: s.bg,
                            border: `1px solid ${s.border}`,
                            color: s.text,
                          }}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className={styles.muted}>—</span>
                )}
              </td>

              <td>
                <div className={styles.actionsCell}>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => onDelete(c.id)}
                    disabled={deletingId === c.id}
                    aria-label={`Delete ${c.name}`}
                    title="Delete customer"
                  >
                    {deletingId === c.id ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden
                      >
                        <circle
                          cx="7"
                          cy="7"
                          r="5.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeDasharray="20"
                          strokeDashoffset="10"
                          style={{
                            animation: 'spin .6s linear infinite',
                            transformOrigin: 'center',
                          }}
                        />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M5.5 6v4.5M8.5 6v4.5M3 3.5l.667 7.333A.5.5 0 0 0 4.16 11.5h5.68a.5.5 0 0 0 .493-.667L11 3.5"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
