import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '@lib/axios';
import styles from './MetaCallback.module.scss';

export const MetaCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error || !code) {
      navigate('/meta/accounts?error=oauth_denied', { replace: true });
      return;
    }

    api
      .get('/meta/callback', { params: { code, ...(state ? { state } : {}) } })
      .then(() => {
        void qc.invalidateQueries({ queryKey: ['meta', 'pages'] });
        navigate('/meta/accounts?connected=1', { replace: true });
      })
      .catch(() => {
        navigate('/meta/accounts?error=callback_failed', { replace: true });
      });
  }, [params, navigate, qc]);

  return (
    <div className={styles.page}>
      <div className={styles.spinner} />
      <p className={styles.label}>Completing authorization…</p>
    </div>
  );
};
