import api from '@lib/axios';
import type {
  MetaAuthUrlResponse,
  MetaCallbackResponse,
  MetaDmsPage,
  MetaPlatform,
} from './types';

export const metaService = {
  getAuthUrl: (platform: MetaPlatform) =>
    api.get<MetaAuthUrlResponse>('/meta/auth-url', { params: { platform } }),

  handleCallback: (code: string, state: string) =>
    api.get<MetaCallbackResponse>('/meta/auth/callback', { params: { code, state } }),

  fetchStatus: (platform: MetaPlatform) =>
    api.get<{ connected: boolean }>('/meta/status', { params: { platform } }),

  fetchDms: (platform: MetaPlatform, cursor?: string) =>
    api.get<MetaDmsPage>('/meta/dms', {
      params: { platform, ...(cursor ? { cursor } : {}) },
    }),
};
