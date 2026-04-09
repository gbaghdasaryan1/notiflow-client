import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InboxLayout } from '../../components/InboxLayout';
import { PlatformBadge } from '../../components/PlatformBadge';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Toast } from '@/shared/components/ui/Toast';
import { useToast } from '@/shared/hooks/useToast';
import { metaService } from '../../services';
import type { MetaAccount, MetaPlatform } from '../../types';
import styles from './MetaAccounts.module.scss';

// ── Platform connect card ─────────────────────────────────────────────────────

type ConnectCardProps = {
  platform: MetaPlatform;
  onConnect: (p: MetaPlatform) => void;
  loading: boolean;
};

const ConnectCard = ({ platform, onConnect, loading }: ConnectCardProps) => {
  const isFb = platform === 'facebook';
  return (
    <button
      type="button"
      className={`${styles.connectCard} ${isFb ? styles.facebook : styles.instagram}`}
      onClick={() => onConnect(platform)}
      disabled={loading}
    >
      <div className={styles.connectIcon}>
        {isFb ? (
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden
          >
            <rect width="28" height="28" rx="6" fill="#1877f2" />
            <path
              d="M18 14h-3v8h-4v-8h-2v-4h2v-2c0-2.76 1.12-4 4-4h3v4h-2c-.55 0-1 .45-1 1v1h3l-.5 4z"
              fill="#fff"
            />
          </svg>
        ) : (
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden
          >
            <rect width="28" height="28" rx="6" fill="url(#igGrad)" />
            <defs>
              <linearGradient
                id="igGrad"
                x1="0"
                y1="28"
                x2="28"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#f09433" />
                <stop offset="0.35" stopColor="#e6683c" />
                <stop offset="0.55" stopColor="#dc2743" />
                <stop offset="0.7" stopColor="#cc2366" />
                <stop offset="1" stopColor="#bc1888" />
              </linearGradient>
            </defs>
            <rect
              x="7"
              y="7"
              width="14"
              height="14"
              rx="4"
              stroke="#fff"
              strokeWidth="1.5"
            />
            <circle cx="14" cy="14" r="3.5" stroke="#fff" strokeWidth="1.5" />
            <circle cx="18.5" cy="9.5" r="1" fill="#fff" />
          </svg>
        )}
      </div>
      <div className={styles.connectInfo}>
        <span className={styles.connectTitle}>
          Connect {isFb ? 'Facebook' : 'Instagram'}
        </span>
        <span className={styles.connectSub}>
          {isFb
            ? 'Access your Facebook Page messages'
            : 'Access your Instagram Business DMs'}
        </span>
      </div>
      {loading ? (
        <span className={styles.connectSpinner} />
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M5 8h6M8 5l3 3-3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};

// ── Connected page row ────────────────────────────────────────────────────────

type PageRowProps = {
  page: MetaAccount;
  onDisconnect: (page: MetaAccount) => void;
};

const PageRow = ({ page, onDisconnect }: PageRowProps) => (
  <div className={styles.pageRow}>
    <div className={styles.pageAvatar}>
      {page.pageName[0]?.toUpperCase() ?? 'P'}
    </div>
    <div className={styles.pageInfo}>
      <span className={styles.pageName}>{page.pageName}</span>
      <div className={styles.pageMeta}>
        <PlatformBadge platform={page.platform} size="sm" />
        <span className={styles.pageDate}>
          Connected{' '}
          {new Date(page.connectedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
    </div>
    <button
      type="button"
      className={styles.disconnectBtn}
      onClick={() => onDisconnect(page)}
    >
      Disconnect
    </button>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────

export const MetaAccountsPage = () => {
  const qc = useQueryClient();
  const { toast, show, dismiss } = useToast();
  const [connectingPlatform, setConnectingPlatform] =
    useState<MetaPlatform | null>(null);
  const [disconnecting, setDisconnecting] = useState<MetaAccount | null>(null);

  const { data: pages, isLoading } = useQuery({
    queryKey: ['meta', 'pages'],
    queryFn: () => metaService.getAccounts().then((response) => response.data),
  });

  const accounts = pages?.accounts ?? [];

  const disconnectMutation = useMutation({
    mutationFn: (pageId: string) => metaService.deleteAccount(pageId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['meta', 'pages'] });
      show('Account disconnected successfully', 'success');
      setDisconnecting(null);
    },
    onError: () => {
      show('Failed to disconnect account. Please try again.', 'error');
      setDisconnecting(null);
    },
  });

  const handleConnect = async (platform: MetaPlatform) => {
    setConnectingPlatform(platform);
    try {
      const { data } = await metaService.getAuthUrl(platform);
      window.location.href = data.url;
    } catch {
      show('Could not start authorization. Please try again.', 'error');
      setConnectingPlatform(null);
    }
  };

  // async function connectMeta(platform: 'facebook' | 'instagram') {
  //   const url = import.meta.env.VITE_API_URL;
  //   const res = await fetch(`${url}/meta/auth-url?platform=${platform}`, {
  //     method: 'GET',
  //     // headers: {
  //     //   Authorization: `Bearer ${token}`,
  //     // },
  //   });

  //   const data = await res.json();
  //   // window.location.href = data.url;
  // }
  return (
    <InboxLayout>
      <Toast toast={toast} onDismiss={dismiss} />

      <ConfirmDialog
        open={Boolean(disconnecting)}
        title="Disconnect account"
        message={
          <>
            Disconnect <strong>{disconnecting?.pageName}</strong>? You will no
            longer receive messages from this page.
          </>
        }
        confirmLabel="Disconnect"
        variant="danger"
        loading={disconnectMutation.isPending}
        onConfirm={() =>
          disconnecting && disconnectMutation.mutate(disconnecting.pageId)
        }
        onCancel={() => setDisconnecting(null)}
      />

      <div className={styles.root}>
        <div className={styles.header}>
          <h1 className={styles.title}>Connected Accounts</h1>
          <p className={styles.subtitle}>
            Connect your Facebook Pages and Instagram Business accounts to
            receive DMs.
          </p>
        </div>

        {/* Warning banner */}
        <div className={styles.warningBanner}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M8 1L15 14H1L8 1z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path
              d="M8 6v4M8 11.5v.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          <div>
            <strong>Meta requirements:</strong> You need a Facebook Business
            account and a connected Instagram Business/Creator profile. Meta's
            messaging window is <strong>24 hours</strong> — you can only reply
            within 24 hours of the last inbound message.
          </div>
        </div>

        {/* Connect buttons */}
        <section>
          <h2 className={styles.sectionTitle}>Add account</h2>
          <div className={styles.connectGrid}>
            <ConnectCard
              platform="facebook"
              onConnect={handleConnect}
              loading={connectingPlatform === 'facebook'}
            />
            <ConnectCard
              platform="instagram"
              onConnect={handleConnect}
              loading={connectingPlatform === 'instagram'}
            />
          </div>
        </section>

        {/* Connected pages */}
        <section>
          <h2 className={styles.sectionTitle}>
            Connected pages
            {accounts.length > 0 && (
              <span className={styles.badge}>{accounts.length}</span>
            )}
          </h2>

          {isLoading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
            </div>
          ) : accounts.length === 0 ? (
            <div className={styles.emptyState}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                aria-hidden
              >
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M13 20h14M20 13v14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p>No accounts connected yet</p>
              <span>
                Connect a Facebook or Instagram account above to get started.
              </span>
            </div>
          ) : (
            <div className={styles.pageList}>
              {accounts.map((page) => (
                <PageRow
                  key={page.pageId}
                  page={page}
                  onDisconnect={setDisconnecting}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </InboxLayout>
  );
};
