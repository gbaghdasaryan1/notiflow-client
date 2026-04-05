import type { Template } from '../../types';
import styles from './TemplateTable.module.scss';

// ── Icons ─────────────────────────────────────────────────────────────────────
const EmailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
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
      d="M1 4.5l5.47 3.8a1 1 0 0 0 1.06 0L13 4.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const SmsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M2 2h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4.5L2 12V3a1 1 0 0 1 1-1z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 6h5M4.5 8h3"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
    <path
      d="M9.5 1.5a1.414 1.414 0 0 1 2 2L4 11H1.5V8.5L9.5 1.5z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
    <path
      d="M1.5 3h10M5 3V2a.5.5 0 0 1 .5-.5h2A.5.5 0 0 1 8 2v1M4.5 5.5v4.5M8.5 5.5v4.5M2.5 3l.625 6.875A.5.5 0 0 0 3.62 10.5h5.76a.5.5 0 0 0 .495-.625L10.5 3"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Skeleton rows ─────────────────────────────────────────────────────────────
const SkeletonRows = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className={styles.skeletonRow}>
        <td>
          <div className={styles.nameCell}>
            <div className={`${styles.skeleton} ${styles.w32}`} />
            <div className={`${styles.skeleton} ${styles.w100}`} />
          </div>
        </td>
        <td>
          <div className={`${styles.skeleton} ${styles.w60}`} />
        </td>
        <td>
          <div className={`${styles.skeleton} ${styles.w180}`} />
        </td>
        <td>
          <div className={`${styles.skeleton} ${styles.w80}`} />
        </td>
        <td />
      </tr>
    ))}
  </>
);

// ── Props ─────────────────────────────────────────────────────────────────────
type Props = {
  templates: Template[];
  loading: boolean;
  deletingId: string | null;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
};

const MAX_VARS_SHOWN = 3;

export const TemplateTable = ({
  templates,
  loading,
  deletingId,
  onEdit,
  onDelete,
}: Props) => (
  <div className={styles.tableWrapper}>
    <table>
      <thead className={styles.thead}>
        <tr>
          <th>Name</th>
          <th>Channel</th>
          <th>Content</th>
          <th>Variables</th>
          <th />
        </tr>
      </thead>

      <tbody className={styles.tbody}>
        {loading ? (
          <SkeletonRows />
        ) : templates.length === 0 ? (
          <tr>
            <td colSpan={5}>
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>📄</div>
                <div className={styles.emptyTitle}>No templates yet</div>
                <div className={styles.emptyText}>
                  Create your first template to start sending.
                </div>
              </div>
            </td>
          </tr>
        ) : (
          templates.map((t) => {
            const visibleVars = t.variables.slice(0, MAX_VARS_SHOWN);
            const extra = t.variables.length - MAX_VARS_SHOWN;

            return (
              <tr key={t.id}>
                {/* Name */}
                <td data-label="Name">
                  <div className={styles.nameCell}>
                    <div
                      className={`${styles.templateIcon} ${styles[t.channel]}`}
                    >
                      {t.channel === 'email' ? <EmailIcon /> : <SmsIcon />}
                    </div>
                    <span className={styles.templateName}>{t.name}</span>
                  </div>
                </td>

                {/* Channel */}
                <td data-label="Channel">
                  <span
                    className={`${styles.channelBadge} ${styles[t.channel]}`}
                  >
                    <span className={styles.dot} />
                    {t.channel === 'email' ? 'Email' : 'SMS'}
                  </span>
                </td>

                {/* Content preview */}
                <td data-label="Content">
                  <span className={styles.contentPreview} title={t.content}>
                    {t.content || <span className={styles.muted}>—</span>}
                  </span>
                </td>

                {/* Variables */}
                <td data-label="Variables">
                  {t.variables.length > 0 ? (
                    <div className={styles.varList}>
                      {visibleVars.map((v) => (
                        <span
                          key={v}
                          className={styles.varBadge}
                        >{`{{${v}}}`}</span>
                      ))}
                      {extra > 0 && (
                        <span className={styles.varMore}>+{extra}</span>
                      )}
                    </div>
                  ) : (
                    <span className={styles.muted}>—</span>
                  )}
                </td>

                {/* Actions */}
                <td>
                  <div className={styles.actionsCell}>
                    <button
                      className={styles.iconBtn}
                      onClick={() => onEdit(t)}
                      aria-label={`Edit ${t.name}`}
                      title="Edit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.danger}`}
                      onClick={() => onDelete(t.id)}
                      disabled={deletingId === t.id}
                      aria-label={`Delete ${t.name}`}
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);
