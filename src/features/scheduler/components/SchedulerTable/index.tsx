import styles from './SchedulerTable.module.scss';
import type { RecurringJob } from '../../types';
import Toggle from '@/shared/components/ui/Toggle';

type Props = {
  jobs: RecurringJob[];
  loading: boolean;
  onToggle: (id: string, nextActive: boolean) => void;
  onDelete: (id: string) => void;
  togglingId: string | null;
  deletingId: string | null;
};

const SkeletonRows = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className={styles.skeletonRow}>
        <td>
          <div className={`${styles.skeleton} ${styles.w60}`} />
        </td>
        <td>
          <div className={`${styles.skeleton} ${styles.w40}`} />
        </td>
        <td>
          <div className={`${styles.skeleton} ${styles.w60}`} />
        </td>
        <td>
          <div className={`${styles.skeleton} ${styles.w40}`} />
        </td>
        <td />
      </tr>
    ))}
  </>
);

const typeLabel = (type: RecurringJob['type']) => {
  switch (type) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'interval':
      return 'Interval';
    default:
      return type;
  }
};

const humanPreview = (job: RecurringJob): string => {
  const t = job.timeOfDay;
  switch (job.type) {
    case 'daily':
      return t ? `Every day at ${t}` : 'Every day';
    case 'weekly': {
      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const d = job.dayOfWeek != null ? days[job.dayOfWeek] : 'day';
      return t ? `Every ${d} at ${t}` : `Every ${d}`;
    }
    case 'monthly': {
      const d = job.dayOfMonth ?? 1;
      return t ? `On day ${d} of each month at ${t}` : `On day ${d} each month`;
    }
    case 'interval': {
      if (!job.interval) return 'Interval';
      const mins = job.interval / 60000;
      if (mins % (60 * 24) === 0) {
        const days = mins / (60 * 24);
        return days === 1 ? 'Every day' : `Every ${days} days`;
      }
      if (mins % 60 === 0) {
        const hours = mins / 60;
        return hours === 1 ? 'Every hour' : `Every ${hours} hours`;
      }
      return mins === 1 ? 'Every minute' : `Every ${mins} minutes`;
    }
    default:
      return '';
  }
};

const formatDateTime = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
};

export const SchedulerTable = ({
  jobs,
  loading,
  onToggle,
  onDelete,
  togglingId,
  deletingId,
}: Props) => (
  <div className={styles.tableWrapper}>
    <table>
      <thead className={styles.thead}>
        <tr>
          <th>Template</th>
          <th>Type</th>
          <th>Time</th>
          <th>Status</th>
          <th>Last Run</th>
          <th />
        </tr>
      </thead>
      <tbody className={styles.tbody}>
        {loading ? (
          <SkeletonRows />
        ) : jobs.length === 0 ? (
          <tr>
            <td colSpan={6}>
              <div className={styles.empty}>
                <div className={styles.emptyTitle}>No automations yet</div>
                <div className={styles.emptyText}>
                  Create your first recurring automation to get started.
                </div>
              </div>
            </td>
          </tr>
        ) : (
          jobs.map((job) => (
            <tr key={job.id}>
              <td data-label="Template">
                <div className={styles.nameCell}>
                  <span className={styles.primary}>
                    {job.template?.name ?? 'Untitled template'}
                  </span>
                  <span className={styles.secondary}>
                    {job.customer?.name ?? 'Any customer'}
                  </span>
                </div>
              </td>
              <td data-label="Type">
                <div className={styles.typeCell}>
                  <span className={styles.typeLabel}>
                    {typeLabel(job.type)}
                  </span>
                  <span className={styles.humanPreview}>
                    {humanPreview(job)}
                  </span>
                </div>
              </td>
              <td className={styles.timeCell} data-label="Time">
                {job.timeOfDay ?? '—'}
              </td>
              <td data-label="Status">
                <div className={styles.statusCell}>
                  <Toggle
                    checked={job.isActive}
                    disabled={togglingId === job.id}
                    onChange={(next) => onToggle(job.id, next)}
                  />
                  <span className={styles.statusLabel}>
                    {job.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
              </td>
              <td className={styles.timeCell} data-label="Last Run">
                {formatDateTime(job.lastRunAt)}
              </td>
              <td>
                <div className={styles.actionsCell}>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => onDelete(job.id)}
                    disabled={deletingId === job.id}
                    aria-label="Delete automation"
                    title="Delete automation"
                  >
                    {deletingId === job.id ? (
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
