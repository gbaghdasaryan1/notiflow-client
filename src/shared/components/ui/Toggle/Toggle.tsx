import type { InputHTMLAttributes } from 'react';
import styles from './Toggle.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Toggle = ({ checked, onChange, disabled, className, ...rest }: Props) => {
  const wrapClasses = [
    styles.switch,
    checked ? styles.checked : '',
    disabled ? styles.disabled : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  return (
    <label className={wrapClasses}>
      <input
        {...rest}
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className={styles.thumb} />
    </label>
  );
};

export default Toggle;
