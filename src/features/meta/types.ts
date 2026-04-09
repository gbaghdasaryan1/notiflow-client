export type MetaPlatform = 'facebook' | 'instagram';

export type MessageStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export interface MetaAccount {
  platform: MetaPlatform;
  pageId: string;
  pageName: string;
  instagramBusinessId?: string;
  connectedAt: string;
}

export interface Conversation {
  _id: string;
  platform: MetaPlatform;
  pageId: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  direction: 'inbound' | 'outbound';
  text: string;
  status: MessageStatus;
  createdAt: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  metaAccounts: MetaAccount[];
}

export interface AuthUrlResponse {
  url: string;
}

export interface MetaAccountsResponse {
  accounts: MetaAccount[];
}

export interface ConversationsResponse {
  data: Conversation[];
  total: number;
  page: number;
  limit: number;
}

export interface MessagesResponse {
  data: Message[];
  total: number;
  page: number;
  limit: number;
}
