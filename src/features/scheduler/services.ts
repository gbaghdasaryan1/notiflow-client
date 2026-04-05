import api from '@lib/axios';
import type { RecurringJob, CreateRecurringRequest, UpdateRecurringJobPayload, ScheduleNotificationRequest, ScheduleNotificationResponse } from './types';


export const schedulerService = {
  // Recurring automation
  getAll: () => api.get<RecurringJob[]>('/recurring'),
  createRecurring: (payload: CreateRecurringRequest) =>
    api.post<RecurringJob>('/recurring', payload),
  update: (id: string, payload: UpdateRecurringJobPayload) =>
    api.patch<RecurringJob>(`/recurring/${id}`, payload),
  remove: (id: string) => api.delete(`/recurring/${id}`),

  // One-off scheduled notification
  scheduleNotification: (payload: ScheduleNotificationRequest) =>
    api.post<ScheduleNotificationResponse>('/scheduler/schedule', payload),
};
