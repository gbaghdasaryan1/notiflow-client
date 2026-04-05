export type MetaPlatform = 'facebook' | 'instagram';

export type MetaAuthUrlResponse = {
  url: string;
};

export type MetaCallbackResponse = {
  success: boolean;
};

export type MetaDm = {
  id:          string;
  senderName?: string;
  senderId?:   string;
  message?:    string;
  snippet?:    string;
  timestamp?:  string;
  unread?:     number;
  [key: string]: unknown;
};

export type MetaDmsPage = {
  data:        MetaDm[];
  nextCursor?: string;
  cursors?:    { before?: string; after?: string };
};
