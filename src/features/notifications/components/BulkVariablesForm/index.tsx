import styles from './BulkVariablesForm.module.scss';

export type CustomerField = 'name' | 'email' | 'phone';

export type VariableConfig =
  | { mode: 'static'; value: string }
  | { mode: 'customer'; field: CustomerField };

const CUSTOMER_FIELDS: { field: CustomerField; label: string }[] = [
  { field: 'name', label: 'Customer name' },
  { field: 'email', label: 'Customer email' },
  { field: 'phone', label: 'Customer phone' },
];

const CUSTOMER_FIELD_SET = new Set<string>(CUSTOMER_FIELDS.map((f) => f.field));

// eslint-disable-next-line react-refresh/only-export-components
export const initVariableConfigs = (
  variables: string[]
): Record<string, VariableConfig> =>
  Object.fromEntries(
    variables.map((v) => [
      v,
      CUSTOMER_FIELD_SET.has(v)
        ? { mode: 'customer' as const, field: v as CustomerField }
        : { mode: 'static' as const, value: '' },
    ])
  );

type Props = {
  variables: string[];
  configs: Record<string, VariableConfig>;
  onChange: (key: string, config: VariableConfig) => void;
  disabled?: boolean;
};

export const BulkVariablesForm = ({
  variables,
  configs,
  onChange,
  disabled,
}: Props) => {
  if (variables.length === 0) {
    return (
      <div className={styles.varsEmpty}>
        This template has no dynamic variables.
      </div>
    );
  }

  return (
    <div className={styles.varsGrid}>
      {variables.map((v) => {
        const config = configs[v] ?? { mode: 'static', value: '' };
        const isCustomer = config.mode === 'customer';

        return (
          <div key={v} className={styles.varRow}>
            <div className={styles.varLabel}>
              <code className={styles.varCode}>{`{{${v}}}`}</code>
            </div>

            <div className={styles.varControls}>
              {/* Mode toggle */}
              <div className={styles.modeToggle}>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${!isCustomer ? styles.active : ''}`}
                  onClick={() => onChange(v, { mode: 'static', value: '' })}
                  disabled={disabled}
                >
                  Static
                </button>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${isCustomer ? styles.active : ''}`}
                  onClick={() =>
                    onChange(v, {
                      mode: 'customer',
                      field: CUSTOMER_FIELD_SET.has(v)
                        ? (v as CustomerField)
                        : 'name',
                    })
                  }
                  disabled={disabled}
                >
                  From customer
                </button>
              </div>

              {/* Value input */}
              {isCustomer ? (
                <select
                  className={styles.varSelect}
                  value={
                    (config as { mode: 'customer'; field: CustomerField }).field
                  }
                  onChange={(e) =>
                    onChange(v, {
                      mode: 'customer',
                      field: e.target.value as CustomerField,
                    })
                  }
                  disabled={disabled}
                >
                  {CUSTOMER_FIELDS.map(({ field, label }) => (
                    <option key={field} value={field}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={styles.varInput}
                  type="text"
                  placeholder={`Same value for all recipients…`}
                  value={(config as { mode: 'static'; value: string }).value}
                  onChange={(e) =>
                    onChange(v, { mode: 'static', value: e.target.value })
                  }
                  disabled={disabled}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
