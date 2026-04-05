import api from '@lib/axios';
import type {
  SendNotificationPayload,
  SendNotificationResponse,
  BulkSendPayload,
  BulkSendResponse,
} from '../types';

export const notificationsApiService = {
  send: (payload: SendNotificationPayload) =>
    api.post<SendNotificationResponse>('/notifications/send', payload),

  sendBulk: (payload: BulkSendPayload) =>
    api.post<BulkSendResponse>('/notifications/send/bulk', payload),
};
