import api from '@lib/axios';
import type {
  AuthUrlResponse,
  ConversationsResponse,
  Message,
  MetaAccountsResponse,
  MetaPlatform,
  MessagesResponse,
  User,
} from './types';

const CONV_LIMIT = 20;
const MSG_LIMIT = 30;

export const metaService = {
  getMe: () => api.get<User>('/auth/me'),

  getAuthUrl: (platform?: MetaPlatform) =>
    api.get<AuthUrlResponse>('/meta/auth-url', {
      params: platform ? { platform } : undefined,
    }),

  handleCallback: (code: string, state?: string) =>
    api.get(`meta/auth-url?platform=instagram`, {
      params: { code, ...(state ? { state } : {}) },
    }),

  getAccounts: () => api.get<MetaAccountsResponse>('/meta/accounts'),

  deleteAccount: (pageId: string) => api.delete(`/meta/accounts/${pageId}`),

  getConversations: (params?: {
    platform?: MetaPlatform;
    search?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<ConversationsResponse>('/conversations', {
      params: { limit: CONV_LIMIT, ...params },
    }),

  getMessages: (conversationId: string, page = 1) =>
    api.get<MessagesResponse>(`/conversations/${conversationId}/messages`, {
      params: { page, limit: MSG_LIMIT },
    }),

  sendMessage: (payload: {
    pageId: string;
    recipientId: string;
    platform: MetaPlatform;
    text: string;
  }) => api.post<Message>('/messages/send', payload),
};
