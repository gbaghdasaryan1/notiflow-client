import { useEffect, useMemo, useRef, useState } from 'react';
import { useChatStore } from '../../store/chat-store';
import { PlatformBadge } from '../PlatformBadge';
import type { Message } from '../../types';
import styles from './ChatView.module.scss';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateSeparator(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (d.getFullYear() === now.getFullYear())
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function groupByDate(messages: Message[]) {
  const groups: { separator: string; messages: Message[] }[] = [];
  let lastSep = '';
  for (const m of messages) {
    const sep = formatDateSeparator(m.createdAt);
    if (sep !== lastSep) {
      groups.push({ separator: sep, messages: [] });
      lastSep = sep;
    }
    groups[groups.length - 1].messages.push(m);
  }
  return groups;
}

// ── Status icon ───────────────────────────────────────────────────────────────

const StatusIcon = ({ status }: { status: Message['status'] }) => {
  if (status === 'pending')
    return (
      <span className={styles.statusPending} title="Pending">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle
            cx="5"
            cy="5"
            r="4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4"
          />
        </svg>
      </span>
    );
  if (status === 'failed')
    return (
      <span className={styles.statusFailed} title="Failed">
        !
      </span>
    );
  if (status === 'sent')
    return (
      <span className={styles.statusSent} title="Sent">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4l3 3 5-6"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  if (status === 'delivered')
    return (
      <span className={styles.statusDelivered} title="Delivered">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path
            d="M1 4l3 3 5-6M5 4l3 3 3-7"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  if (status === 'read')
    return (
      <span className={styles.statusRead} title="Read">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path
            d="M1 4l3 3 5-6M5 4l3 3 3-7"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  return null;
};

// ── Skeleton ─────────────────────────────────────────────────────────────────

const MessageSkeleton = () => (
  <div className={styles.skeletonWrap}>
    {[80, 55, 70, 60, 90].map((w, i) => (
      <div
        key={i}
        className={`${styles.skeletonBubble} ${i % 2 === 0 ? styles.skeletonIn : styles.skeletonOut}`}
        style={{ width: `${w}%`, maxWidth: 320 }}
      />
    ))}
  </div>
);

// ── Message bubble ────────────────────────────────────────────────────────────

const Bubble = ({ msg }: { msg: Message }) => {
  const isOut = msg.direction === 'outbound';
  return (
    <div
      className={`${styles.bubble} ${isOut ? styles.outbound : styles.inbound}`}
    >
      <p className={styles.bubbleText}>{msg.text}</p>
      <div className={styles.bubbleMeta}>
        <span className={styles.bubbleTime}>{formatTime(msg.createdAt)}</span>
        {isOut && <StatusIcon status={msg.status} />}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const ChatView = () => {
  const activeId = useChatStore((s) => s.activeId);
  const conversations = useChatStore((s) => s.conversations);
  const messages = useChatStore((s) =>
    activeId ? (s.messages[activeId] ?? null) : null
  );
  const hasMoreMessages = useChatStore((s) =>
    activeId ? (s.messagesHasMore[activeId] ?? false) : false
  );
  const loadMessages = useChatStore((s) => s.loadMessages);
  const loadMoreMessages = useChatStore((s) => s.loadMoreMessages);

  const activeConv = useMemo(
    () => conversations.find((c) => c._id === activeId) ?? null,
    [conversations, activeId]
  );

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);
  const prevActiveRef = useRef<string | null>(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeId) return;
    if (prevActiveRef.current === activeId) return;
    prevActiveRef.current = activeId;
    setLoading(true);
    loadMessages(activeId).finally(() => setLoading(false));
  }, [activeId, loadMessages]);

  // Auto-scroll: instant on first load, smooth on new messages
  useEffect(() => {
    if (!messages) return;
    const len = messages.length;
    if (prevActiveRef.current !== activeId) {
      // new conversation — scroll instantly after render
      requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView());
    } else if (len > prevLenRef.current) {
      // new message arrived — scroll smoothly only if near bottom
      const el = scrollAreaRef.current;
      const nearBottom = el
        ? el.scrollHeight - el.scrollTop - el.clientHeight < 120
        : true;
      const lastIsOut = messages[len - 1]?.direction === 'outbound';
      if (nearBottom || lastIsOut) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevLenRef.current = len;
  }, [messages, activeId]);

  // Load older messages on scroll to top
  const handleScroll = () => {
    const el = scrollAreaRef.current;
    if (!el || !activeId) return;
    if (el.scrollTop < 60 && hasMoreMessages && !loadingMore) {
      const prevHeight = el.scrollHeight;
      setLoadingMore(true);
      loadMoreMessages(activeId)
        .then(() => {
          // Restore scroll position after prepend
          requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight - prevHeight;
          });
        })
        .finally(() => setLoadingMore(false));
    }
  };

  const groups = useMemo(
    () => (messages ? groupByDate(messages) : []),
    [messages]
  );

  // ── Empty state
  if (!activeConv) {
    return (
      <div className={styles.empty}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
          <path
            d="M40 28c0 2.2-1.8 4-4 4H12L4 40V8a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v20z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M14 18h20M14 24h12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <p>Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerAvatar}>
          {activeConv.participantAvatar ? (
            <img
              src={activeConv.participantAvatar}
              alt={activeConv.participantName}
              className={styles.headerAvatarImg}
            />
          ) : (
            activeConv.participantName
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() ?? '')
              .join('')
          )}
        </div>
        <div className={styles.headerInfo}>
          <span className={styles.headerName}>
            {activeConv.participantName}
          </span>
          <div className={styles.headerMeta}>
            <PlatformBadge platform={activeConv.platform} size="sm" />
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollAreaRef}
        className={styles.messages}
        onScroll={handleScroll}
      >
        {loadingMore && <div className={styles.loadingMoreSpinner} />}

        {loading ? (
          <MessageSkeleton />
        ) : (
          groups.map((group) => (
            <div key={group.separator}>
              <div className={styles.dateSeparator}>
                <span>{group.separator}</span>
              </div>
              <div className={styles.messageGroup}>
                {group.messages.map((msg) => (
                  <Bubble key={msg._id} msg={msg} />
                ))}
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
