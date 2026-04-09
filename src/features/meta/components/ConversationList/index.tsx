import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChatStore, type InboxFilter } from '../../store/chat-store';
import { PlatformBadge } from '../PlatformBadge';
import type { Conversation } from '../../types';
import styles from './ConversationList.module.scss';

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonItem = () => (
  <div className={styles.skeletonItem}>
    <div className={styles.skeletonAvatar} />
    <div className={styles.skeletonBody}>
      <div className={styles.skeletonLine} style={{ width: '60%' }} />
      <div
        className={styles.skeletonLine}
        style={{ width: '85%', marginTop: 6 }}
      />
    </div>
  </div>
);

// ── Conversation item ─────────────────────────────────────────────────────────

type ItemProps = {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
};

const ConvItem = ({ conv, isActive, onClick }: ItemProps) => (
  <button
    type="button"
    className={`${styles.item} ${isActive ? styles.active : ''} ${conv.unreadCount > 0 ? styles.unread : ''}`}
    onClick={onClick}
    aria-pressed={isActive}
  >
    <div className={styles.avatar}>
      {conv.participantAvatar ? (
        <img
          src={conv.participantAvatar}
          alt={conv.participantName}
          className={styles.avatarImg}
        />
      ) : (
        initials(conv.participantName)
      )}
    </div>
    <div className={styles.body}>
      <div className={styles.row}>
        <span className={styles.name}>{conv.participantName}</span>
        <span className={styles.time}>{relativeTime(conv.lastMessageAt)}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.preview}>{conv.lastMessage}</span>
        {conv.unreadCount > 0 && (
          <span className={styles.unreadBadge}>
            {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
          </span>
        )}
      </div>
      <div className={styles.badgeRow}>
        <PlatformBadge platform={conv.platform} size="sm" />
      </div>
    </div>
  </button>
);

// ── Filter tabs ───────────────────────────────────────────────────────────────

const FILTERS: { value: InboxFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'unread', label: 'Unread' },
];

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  onSelect?: (id: string) => void;
};

export const ConversationList = ({ onSelect }: Props) => {
  const conversations = useChatStore((s) => s.conversations);
  const hasMore = useChatStore((s) => s.conversationsHasMore);
  const page = useChatStore((s) => s.conversationsPage);
  const activeId = useChatStore((s) => s.activeId);
  const filter = useChatStore((s) => s.filter);
  const search = useChatStore((s) => s.search);
  const setActive = useChatStore((s) => s.setActive);
  const setFilter = useChatStore((s) => s.setFilter);
  const setSearch = useChatStore((s) => s.setSearch);
  const loadConversations = useChatStore((s) => s.loadConversations);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    loadConversations(1).finally(() => setLoading(false));
  }, [filter, search, loadConversations]);

  // Debounced search sync to store
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(localSearch), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localSearch, setSearch]);

  // Infinite scroll — load next page
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await loadConversations(page + 1).finally(() => setLoadingMore(false));
  }, [hasMore, loadingMore, page, loadConversations]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // Filtered + searched list
  const filtered = useMemo(() => {
    let list = conversations;
    if (filter === 'unread') list = list.filter((c) => c.unreadCount > 0);
    else if (filter !== 'all') list = list.filter((c) => c.platform === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.participantName.toLowerCase().includes(q));
    }
    return list;
  }, [conversations, filter, search]);

  return (
    <div className={styles.root}>
      {/* Search */}
      <div className={styles.searchWrap}>
        <svg
          className={styles.searchIcon}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
        >
          <circle
            cx="6"
            cy="6"
            r="4.5"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path
            d="M9.5 9.5L13 13"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search conversations…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          aria-label="Search conversations"
        />
      </div>

      {/* Filter tabs */}
      <div className={styles.tabs} role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            type="button"
            aria-selected={filter === f.value}
            className={`${styles.tab} ${filter === f.value ? styles.tabActive : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className={styles.list} role="listbox" aria-label="Conversations">
        {loading ? (
          Array.from({ length: 6 }, (_, i) => <SkeletonItem key={i} />)
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden
            >
              <path
                d="M28 20c0 1.1-.9 2-2 2H8l-4 4V6a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v14z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <p>{search ? 'No matches found' : 'No conversations yet'}</p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConvItem
              key={conv._id}
              conv={conv}
              isActive={conv._id === activeId}
              onClick={() => {
                setActive(conv._id);
                onSelect?.(conv._id);
              }}
            />
          ))
        )}

        {/* Infinite scroll sentinel */}
        {!loading && hasMore && (
          <div ref={sentinelRef} className={styles.sentinel}>
            {loadingMore && <div className={styles.loadingMore} />}
          </div>
        )}
      </div>
    </div>
  );
};
