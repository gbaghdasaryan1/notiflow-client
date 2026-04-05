import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import styles from './InstagramSuccess.module.scss';

export const InstagramSuccessPage = () => {
  const navigate = useNavigate();
  const qc       = useQueryClient();

  useEffect(() => {
    // Reset cached Meta queries so the DMs page re-checks connection status fresh
    void qc.resetQueries({ queryKey: ['meta'] });
    navigate('/meta/dms', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.spinner} />
      <p className={styles.label}>Connecting Instagram…</p>
    </div>
  );
};
