import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schedulerService } from './services';
import type { CreateRecurringRequest, RecurringJob, UpdateRecurringJobPayload, ScheduleNotificationRequest } from './types';


export const SCHEDULER_JOBS_KEY = ['scheduler', 'jobs'] as const;

export const useSchedulerJobsQuery = () =>
  useQuery({
    queryKey: SCHEDULER_JOBS_KEY,
    queryFn: () => schedulerService.getAll().then((r) => r.data),
  });

export const useCreateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRecurringRequest) =>
      schedulerService.createRecurring(payload).then((r) => r.data),
    onSuccess: (job: RecurringJob) => {
      qc.setQueryData<RecurringJob[]>(SCHEDULER_JOBS_KEY, (old = []) => [job, ...old]);
    },
  });
};

export const useUpdateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRecurringJobPayload }) =>
      schedulerService.update(id, payload).then((r) => r.data),
    onSuccess: (job: RecurringJob) => {
      qc.setQueryData<RecurringJob[]>(SCHEDULER_JOBS_KEY, (old = []) =>
        old.map((j) => (j.id === job.id ? job : j)),
      );
    },
  });
};

export const useDeleteJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulerService.remove(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<RecurringJob[]>(SCHEDULER_JOBS_KEY, (old = []) =>
        old.filter((j) => j.id !== id),
      );
    },
  });
};

export const useScheduleNotification = () =>
  useMutation({
    mutationFn: (payload: ScheduleNotificationRequest) =>
      schedulerService.scheduleNotification(payload).then((r) => r.data),
  });
