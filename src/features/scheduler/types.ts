import type { Customer } from '@features/customers/types';
import type { Template } from '@features/templates';

// ── Shared enums ─────────────────────────────────────────────────────────────

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'interval';

export type IntervalUnit = 'minutes' | 'hours' | 'days';

// ── One-off scheduling (POST /scheduler/schedule) ────────────────────────────

export type ScheduleNotificationRequest = {
  templateId: string;
  customerId: string;
  delay?: number; // milliseconds until send
  scheduledAt?: string; // ISO string; backend converts to delay
  // Template variables / payload
  data?: Record<string, unknown>;
};

export type ScheduleNotificationResponse = {
  id: string;
  status: string;
  scheduledAt?: string;
};

// ── Recurring scheduling (POST /recurring) ──────────────────────────────────

// Mirrors backend CreateRecurringDto
export type CreateRecurringRequest = {
  timeOfDay?: string;
  intervalMs?: number;
  templateId: string;
  customerId: string;
  type: RecurrenceType;
  // For interval type (ms)
  interval?: number;
  // For weekly
  dayOfWeek?: number; // 0-6
  // For monthly
  dayOfMonth?: number; // 1-31
};

// Typical shape of a recurring job returned by the API
export type RecurringJob = CreateRecurringRequest & {
  id: string;
  isActive: boolean;
  lastRunAt?: string;
  createdAt?: string;
  // Optional, if backend includes a canonical local time of day
  timeOfDay?: string;
  // Optionally hydrated for display on the frontend
  template?: Template;
  customer?: Customer;
};

export type UpdateRecurringJobPayload = {
  isActive?: boolean;
};

// Backwards-compatible alias used by existing UI code
export type CreateRecurringJobPayload = CreateRecurringRequest;
