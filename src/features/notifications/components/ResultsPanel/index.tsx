import type { Customer } from '@features/customers/types';
import type { BulkSendResponse } from '../../types';
import Button from '@shared/components/ui/Button';
import styles from './ResultsPanel.module.scss';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

type Props = {
  results: BulkSendResponse['results'];
  customers: Customer[];
  onReset: () => void;
};

export const ResultsPanel = ({ results, customers, onReset }: Props) => {
  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const successCount = results.filter((r) => !r.error).length;
  const failedCount = results.length - successCount;

  return (
    <div className={styles.results}>
      <div className={styles.resultsHeader}>
        <div className={styles.resultsIcon}>✓</div>
        <h2>Bulk Send Complete</h2>
        <p>
          <span className={styles.successCount}>{successCount} sent</span>
          {failedCount > 0 && (
            <span className={styles.failedCount}> · {failedCount} failed</span>
          )}
        </p>
      </div>

      <div className={styles.resultsList}>
        {results.map((r, i) => {
          const customer = customerMap.get(r.customerId);
          const ok = !r.error;
          return (
            <div
              key={i}
              className={`${styles.resultRow} ${ok ? styles.ok : styles.fail}`}
            >
              <div className={styles.resultLeft}>
                <div className={styles.resultAvatar}>
                  {customer ? initials(customer.name) : '?'}
                </div>
                <div>
                  <span className={styles.resultName}>
                    {customer?.name ?? r.customerId}
                  </span>
                  {r.error && (
                    <span className={styles.resultError}>{r.error}</span>
                  )}
                </div>
              </div>
              <span
                className={`${styles.resultStatus} ${ok ? styles.ok : styles.fail}`}
              >
                {ok ? '✓ Sent' : '✗ Failed'}
              </span>
            </div>
          );
        })}
      </div>

      <div className={styles.resultsActions}>
        <Button onClick={onReset}>Send Another Bulk</Button>
      </div>
    </div>
  );
};
