import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './Input.module.scss';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  iconRight?: ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, iconRight, id, className, ...rest }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const inputClasses = [
      styles.input,
      error ? styles.hasError : '',
      iconRight ? styles.hasIcon : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.wrapper}>
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          <input ref={ref} id={inputId} className={inputClasses} {...rest} />
          {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
