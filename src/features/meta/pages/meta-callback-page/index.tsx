import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMetaCallback } from '../../use-meta.api';
import styles from './MetaCallback.module.scss';

export const MetaCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const callback       = useMetaCallback();

  const [missingParams] = useState(
    () => !searchParams.get('code') || !searchParams.get('state')
  );

  // Guard against React StrictMode double-invocation — OAuth codes are single-use
  const called = useRef(false);

  useEffect(() => {
    if (missingParams || called.current) return;
    called.current = true;
    callback.mutate({
      code:  searchParams.get('code')!,
      state: searchParams.get('state')!,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showPending = !missingParams && callback.isPending;
  const showError   = missingParams || callback.isError;

  const errorMessage = missingParams
    ? 'Authorization was denied or the link is invalid.'
    : ((callback.error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Something went wrong. Please try again.');

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {showPending && (
          <>
            <div className={styles.spinner} />
            <h2>Connecting…</h2>
            <p>Completing your Meta authorization.</p>
          </>
        )}

        {/* Success navigates automatically via onSuccess — only errors stay on this page */}
        {showError && (
          <>
            <div className={styles.iconError}>✗</div>
            <h2>Connection Failed</h2>
            <p className={styles.errorMsg}>{errorMessage}</p>
          </>
        )}
      </div>
    </div>
  );
};
