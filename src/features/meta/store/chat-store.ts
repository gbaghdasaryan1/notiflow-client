import { create } from 'zustand';
import { metaService } from '../services';
import type {
  Conversation,
  Message,
  MessageStatus,
  MetaPlatform,
} from '../types';

export type InboxFilter = 'all' | MetaPlatform | 'unread';

interface ChatState {
  conversations: Conversation[];
  conversationsPage: number;
  conversationsHasMore: boolean;
  messages: Record<string, Message[]>;
  messagesPage: Record<string, number>;
  messagesHasMore: Record<string, boolean>;
  activeId: string | null;
  filter: InboxFilter;
  search: string;

  setActive: (id: string | null) => void;
  setFilter: (filter: InboxFilter) => void;
  setSearch: (search: string) => void;

  loadConversations: (page?: number) => Promise<void>;
  loadMessages: (convId: string) => Promise<void>;
  loadMoreMessages: (convId: string) => Promise<void>;
  sendMessage: (conv: Conversation, text: string) => Promise<void>;

  onIncoming: (payload: {
    conversation: Conversation;
    message: Message;
  }) => void;
  updateMessageStatus: (payload: {
    messageId: string;
    conversationId: string;
    status: MessageStatus;
  }) => void;
  clearUnread: (convId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  conversationsPage: 0,
  conversationsHasMore: true,
  messages: {},
  messagesPage: {},
  messagesHasMore: {},
  activeId: null,
  filter: 'all',
  search: '',

  setActive: (id) => {
    set({ activeId: id });
    if (id) get().clearUnread(id);
  },

  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),

  loadConversations: async (page = 1) => {
    const { filter, search } = get();
    const { data: res } = await metaService.getConversations({
      page,
      platform:
        filter === 'facebook' || filter === 'instagram' ? filter : undefined,
      search: search.trim() || undefined,
    });
    const hasMore = res.page * res.limit < res.total;
    set((state) => ({
      conversations:
        page === 1 ? res.data : [...state.conversations, ...res.data],
      conversationsPage: res.page,
      conversationsHasMore: hasMore,
    }));
  },

  loadMessages: async (convId) => {
    const { data: res } = await metaService.getMessages(convId, 1);
    const hasMore = res.page * res.limit < res.total;
    set((state) => ({
      messages: { ...state.messages, [convId]: res.data },
      messagesPage: { ...state.messagesPage, [convId]: 1 },
      messagesHasMore: { ...state.messagesHasMore, [convId]: hasMore },
    }));
  },

  loadMoreMessages: async (convId) => {
    if (!get().messagesHasMore[convId]) return;
    const nextPage = (get().messagesPage[convId] ?? 1) + 1;
    const { data: res } = await metaService.getMessages(convId, nextPage);
    const hasMore = res.page * res.limit < res.total;
    set((state) => ({
      // Older messages prepend to the top
      messages: {
        ...state.messages,
        [convId]: [...res.data, ...(state.messages[convId] || [])],
      },
      messagesPage: { ...state.messagesPage, [convId]: nextPage },
      messagesHasMore: { ...state.messagesHasMore, [convId]: hasMore },
    }));
  },

  sendMessage: async (conv, text) => {
    const tempId = `temp_${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      conversationId: conv._id,
      text,
      direction: 'outbound',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [conv._id]: [...(state.messages[conv._id] || []), tempMessage],
      },
    }));

    try {
      const { data: realMessage } = await metaService.sendMessage({
        pageId: conv.pageId,
        recipientId: conv.participantId,
        platform: conv.platform,
        text,
      });
      set((state) => ({
        messages: {
          ...state.messages,
          [conv._id]: (state.messages[conv._id] || []).map((m) =>
            m._id === tempId ? realMessage : m
          ),
        },
      }));
    } catch {
      set((state) => ({
        messages: {
          ...state.messages,
          [conv._id]: (state.messages[conv._id] || []).map((m) =>
            m._id === tempId ? { ...m, status: 'failed' as const } : m
          ),
        },
      }));
      throw new Error('Failed to send message');
    }
  },

  onIncoming: ({ conversation, message }) => {
    set((state) => {
      const existing = state.conversations.find(
        (c) => c._id === conversation._id
      );
      const updated = existing
        ? state.conversations.map((c) =>
            c._id === conversation._id ? conversation : c
          )
        : [conversation, ...state.conversations];
      const sorted = [...updated].sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      );
      const hasLoaded = Boolean(state.messages[conversation._id]);
      return {
        conversations: sorted,
        messages: hasLoaded
          ? {
              ...state.messages,
              [conversation._id]: [
                ...(state.messages[conversation._id] || []),
                message,
              ],
            }
          : state.messages,
      };
    });
  },

  updateMessageStatus: ({ messageId, conversationId, status }) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((m) =>
          m._id === messageId ? { ...m, status } : m
        ),
      },
    }));
  },

  clearUnread: (convId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === convId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },
}));
