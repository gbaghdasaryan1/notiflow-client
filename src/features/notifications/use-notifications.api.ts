import { useMutation } from '@tanstack/react-query';
import { notificationsApiService } from './services/api-services';
import type { BulkSendPayload, SendNotificationPayload } from './types';

export const useSendNotification = () =>
  useMutation({
    mutationFn: (payload: SendNotificationPayload) =>
      notificationsApiService.send(payload).then((r) => r.data),
  });

export const useSendBulkNotification = () =>
  useMutation({
    mutationFn: (payload: BulkSendPayload) =>
      notificationsApiService.sendBulk(payload).then((r) => r.data),
  });
