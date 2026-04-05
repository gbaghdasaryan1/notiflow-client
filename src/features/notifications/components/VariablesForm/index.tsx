/* eslint-disable react-refresh/only-export-components */
import type { Customer } from '@features/customers/types';
import { VAR_RE } from '@lib/template-variables';
import styles from './VariablesForm.module.scss';

type Props = {
  variables: string[];
  values:    Record<string, string>;
  customer:  Customer | null;
  onChange:  (key: string, val: string) => void;
  disabled?: boolean;
}

export const prefillFromCustomer = (
  variables: string[],
  customer: Customer | null,
): Record<string, string> => {
  if (!customer) return {};

  const map: Record<string, string> = {};
  for (const key of variables) {
    if (key === 'name' && customer.name) map[key] = customer.name;
    if (key === 'email' && customer.email) map[key] = customer.email;
    if (key === 'phone' && customer.phone) map[key] = customer.phone;
  }
  return map;
};

export const VariablesForm = ({ variables, values, customer, onChange, disabled }: Props) => {
  if (variables.length === 0) {
    return (
      <div className={styles.emptyState}>
        This template has no dynamic variables.
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {variables.map((v) => {
          const isPrefilled = Boolean(customer && VAR_RE.test(`{{${v}}}`));
          return (
            <div key={v} className={styles.field}>
              <div className={styles.labelRow}>
                <span className={styles.varLabel}>{`{{${v}}}`}</span>
                {isPrefilled && (
                  <span className={`${styles.sourceTag} ${styles.customer}`}>from customer</span>
                )}
              </div>
              <input
                className={`${styles.input} ${isPrefilled && values[v] ? styles.prefilled : ''}`}
                type="text"
                placeholder={`Enter ${v}…`}
                value={values[v] ?? ''}
                onChange={(e) => onChange(v, e.target.value)}
                disabled={disabled}
                aria-label={v}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

