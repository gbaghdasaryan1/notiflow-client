import { useEffect, useRef, useState } from 'react';
import { type AxiosError } from 'axios';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@shared/components/layout/dashboard/DashboardLayout';
import {
  useConnectMeta,
  useMetaCallback,
  useMetaDms,
  useMetaStatus,
} from '../../use-meta.api';
import { useQueryClient } from '@tanstack/react-query';
import type { MetaPlatform } from '../../types';
import styles from './MetaDms.module.scss';

// ── OAuth code exchange (redirect lands here, not /meta/callback) ─────────────
const useHandleOAuthCode = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const callback = useMetaCallback();
  const called = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (!code || !state || called.current) return;

    called.current = true;
    setSearchParams({}, { replace: true });
    callback.mutate(
      { code, state },
      {
        onSuccess: () => void qc.resetQueries({ queryKey: ['meta'] }),
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return callback;
};

// ── Platform tabs ─────────────────────────────────────────────────────────────
const PLATFORMS: { value: MetaPlatform; label: string }[] = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
];

// ── Connection status badge ───────────────────────────────────────────────────
const StatusBadge = ({
  platform,
  onConnect,
  connecting,
}: {
  platform: MetaPlatform;
  onConnect: () => void;
  connecting: boolean;
}) => {
  const { isLoading, data } = useMetaStatus(platform);
  const platformLabel = platform === 'facebook' ? 'Facebook' : 'Instagram';
  const isConnected = data?.connected === true;

  if (isLoading) {
    return (
      <div className={styles.statusBar}>
        <span className={`${styles.dot} ${styles.checking}`} />
        <span className={styles.statusText}>
          Checking {platformLabel} connection…
        </span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className={styles.statusBar}>
        <span className={`${styles.dot} ${styles.connected}`} />
        <span className={styles.statusText}>
          {platformLabel} <strong>connected</strong>
        </span>
        <button
          className={styles.reconnectBtn}
          disabled={connecting}
          onClick={onConnect}
        >
          {connecting ? 'Redirecting…' : 'Reconnect'}
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.statusBar} ${styles.statusBarAlert}`}>
      <span className={`${styles.dot} ${styles.disconnected}`} />
      <span className={styles.statusText}>
        {platformLabel} <strong>not connected</strong>
      </span>
      <button
        className={styles.connectBtnSm}
        disabled={connecting}
        onClick={onConnect}
      >
        {connecting ? 'Redirecting…' : `Connect ${platformLabel}`}
      </button>
    </div>
  );
};

// ── DM card ───────────────────────────────────────────────────────────────────
const DmCard = ({ dm }: { dm: Record<string, unknown> }) => {
  const name = (dm.senderName ?? dm.from?.toString() ?? 'Unknown') as string;
  const preview = (dm.snippet ?? dm.message ?? '—') as string;
  const time = dm.timestamp as string | undefined;
  const unread = dm.unread as number | undefined;

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('');

  return (
    <div className={styles.dmCard}>
      <div className={styles.dmAvatar}>{initials || '?'}</div>
      <div className={styles.dmBody}>
        <div className={styles.dmTop}>
          <span className={styles.dmName}>{name}</span>
          {time && (
            <span className={styles.dmTime}>
              {new Date(time).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className={styles.dmBottom}>
          <span className={styles.dmPreview}>{preview}</span>
          {unread != null && unread > 0 && (
            <span className={styles.dmBadge}>
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const MetaDmsPage = () => {
  const [platform, setPlatform] = useState<MetaPlatform>('facebook');

  const oauthExchange = useHandleOAuthCode();
  const connect       = useConnectMeta();
  const status        = useMetaStatus(platform);

  const handleConnect = () => {
    if (platform === 'instagram') {
      // Instagram uses a dedicated backend endpoint (not the generic /meta/auth-url)
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/instagram`;
    } else {
      handleConnect();
    }
  };
  const {
    data,
    isLoading: dmsLoading,
    isError: dmsError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMetaDms(platform);

  const dms = data?.pages.flatMap((p) => p.data) ?? [];

  const errStatus = (error as AxiosError)?.response?.status;
  const isNoAuth = errStatus === 401 || errStatus === 403;
  // Only show DM section once we know the account is linked
  const showDms = status.data?.connected === true;

  return (
    <DashboardLayout>
      <div className={styles.pageHeader}>
        <h1>Messages</h1>
        <p>View and manage direct messages from Facebook and Instagram.</p>
      </div>

      {/* Platform tabs */}
      <div className={styles.tabs}>
        {PLATFORMS.map(({ value, label }) => (
          <button
            key={value}
            className={`${styles.tab} ${platform === value ? styles.active : ''}`}
            onClick={() => setPlatform(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* OAuth exchange banner — shown while the code is being sent to the backend */}
      {oauthExchange.isPending && (
        <div className={styles.statusBar}>
          <div
            className={styles.spinner}
            style={{ width: 12, height: 12, borderWidth: 2 }}
          />
          <span className={styles.statusText}>Completing connection…</span>
        </div>
      )}

      {/* Connection status — shown once exchange is done or no code in URL */}
      {!oauthExchange.isPending && (
        <StatusBadge
          platform={platform}
          onConnect={() => handleConnect()}
          connecting={connect.isPending}
        />
      )}

      {/* DM content — only shown when connected */}
      <div className={styles.content}>
        {showDms && dmsLoading && (
          <div className={styles.stateBox}>
            <div className={styles.spinner} />
            <span>Loading messages…</span>
          </div>
        )}

        {showDms && dmsError && isNoAuth && (
          <div className={styles.stateBox}>
            <div className={styles.stateIcon}>🔗</div>
            <h3>Session expired</h3>
            <p>
              Please reconnect your{' '}
              {platform === 'facebook' ? 'Facebook' : 'Instagram'} account.
            </p>
          </div>
        )}

        {showDms && dmsError && !isNoAuth && (
          <div className={styles.stateBox}>
            <div className={styles.stateIcon}>⚠</div>
            <h3>Missing permissions</h3>
            <p>
              {(error as AxiosError<{ message?: string }>)?.response?.data
                ?.message ?? 'An unexpected error occurred.'}
            </p>
            <p className={styles.stateHint}>
              This is a Facebook app configuration issue — the app needs
              additional permissions approved in the Meta Developer Console.
            </p>
          </div>
        )}

        {showDms && !dmsLoading && !dmsError && dms.length === 0 && (
          <div className={styles.stateBox}>
            <div className={styles.stateIcon}>💬</div>
            <h3>No messages yet</h3>
            <p>
              Your {platform === 'facebook' ? 'Facebook' : 'Instagram'} messages
              will appear here.
            </p>
          </div>
        )}

        {showDms && dms.length > 0 && (
          <>
            <div className={styles.dmList}>
              {dms.map((dm) => (
                <DmCard
                  key={dm.id as string}
                  dm={dm as Record<string, unknown>}
                />
              ))}
            </div>
            {hasNextPage && (
              <div className={styles.loadMoreRow}>
                <button
                  className={styles.loadMoreBtn}
                  onClick={() => void fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
