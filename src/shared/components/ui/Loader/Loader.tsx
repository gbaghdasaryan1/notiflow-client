import styles from './Loader.module.scss';

type LoaderProps = {
  overlay?: boolean;
  text?: string;
};

const Loader = ({ overlay = false, text }: LoaderProps) => {
  const spinner = (
    <div className={styles.spinner}>
      <div className={styles.ring} aria-hidden="true" />
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );

  if (overlay) {
    return (
      <div className={styles.overlay} role="status" aria-label={text ?? 'Loading'}>
        {spinner}
      </div>
    );
  }

  return (
    <div className={styles.inline} role="status" aria-label={text ?? 'Loading'}>
      <div className={styles.ring} aria-hidden="true" />
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
};

export default Loader;
