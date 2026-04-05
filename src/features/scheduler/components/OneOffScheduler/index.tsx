import { type AxiosError } from 'axios';
import { useState } from 'react';
import styles from './OneOffScheduler.module.scss';
import type { Customer } from '@features/customers/types';
import { useCustomersQuery } from '@features/customers/use-customer.api';
import { CustomerSelector, TemplateSelector } from '@features/notifications';
import { useScheduleNotification } from '../../use-scheduler.api';
import type { ScheduleNotificationRequest } from '../../types';
import { useTemplatesQuery, type Template } from '@/features/templates';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';

type Mode = 'delay' | 'datetime';

export const OneOffScheduler = () => {
  const { data: customers = [], isLoading: customersLoading } =
    useCustomersQuery();
  const { data: templates = [], isLoading: templatesLoading } =
    useTemplatesQuery();
  const scheduleNotification = useScheduleNotification();

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [mode, setMode] = useState<Mode>('delay');
  const [delayValue, setDelayValue] = useState('');
  const [delayUnit, setDelayUnit] = useState<'minutes' | 'hours'>('minutes');
  const [scheduledAt, setScheduledAt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const toDelayMs = () => {
    const v = Number(delayValue);
    if (!delayValue || Number.isNaN(v) || v <= 0) return undefined;
    const base = v * 60_000;
    return delayUnit === 'hours' ? base * 60 : base;
  };

  const canSubmit = () => {
    if (!selectedTemplate || !selectedCustomer) return false;
    if (mode === 'delay') return Boolean(toDelayMs());
    if (mode === 'datetime') return Boolean(scheduledAt);
    return false;
  };

  const handleSubmit = async () => {
    if (!selectedTemplate || !selectedCustomer) return;

    const body: ScheduleNotificationRequest = {
      templateId: selectedTemplate.id,
      customerId: selectedCustomer.id,
    };

    if (mode === 'delay') {
      const delay = toDelayMs();
      if (!delay) return;
      body.delay = delay;
    } else if (mode === 'datetime') {
      if (!scheduledAt) return;
      const d = new Date(scheduledAt);
      if (Number.isNaN(d.getTime())) return;
      body.scheduledAt = d.toISOString();
    }

    setErrorMsg('');
    try {
      await scheduleNotification.mutateAsync(body);
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setErrorMsg(
        e.response?.data?.message ??
          'Failed to schedule notification. Please try again.'
      );
    }
  };

  return (
    <section className={styles.card} aria-label="Schedule one-off notification">
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Schedule One-Off Notification</h2>
          <p className={styles.subtitle}>
            Queue a single notification to be sent later without creating a
            recurring rule.
          </p>
        </div>
        <span className={styles.pill}>One-off</span>
      </div>

      <div className={styles.layout}>
        <div className={styles.col}>
          <div className={styles.sectionLabel}>Template</div>
          <TemplateSelector
            templates={templates}
            loading={templatesLoading}
            value={selectedTemplate}
            onChange={setSelectedTemplate}
          />
        </div>
        <div className={styles.col}>
          <div className={styles.sectionLabel}>Customer</div>
          <CustomerSelector
            customers={customers}
            loading={customersLoading}
            value={selectedCustomer}
            onChange={setSelectedCustomer}
          />
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.col}>
          <div className={styles.sectionLabel}>Mode</div>
          <div className={styles.modeTabs}>
            <button
              type="button"
              className={`${styles.modeTab} ${mode === 'delay' ? 'active' : ''}`}
              onClick={() => setMode('delay')}
            >
              After delay
            </button>
            <button
              type="button"
              className={`${styles.modeTab} ${mode === 'datetime' ? 'active' : ''}`}
              onClick={() => setMode('datetime')}
            >
              At specific time
            </button>
          </div>
          <p className={styles.helper}>
            Choose whether to schedule based on a delay or an exact date/time.
          </p>
        </div>
      </div>

      {mode === 'delay' && (
        <div className={styles.layout}>
          <div className={styles.col}>
            <Input
              label="Delay"
              type="number"
              min={1}
              value={delayValue}
              onChange={(e) => setDelayValue(e.target.value)}
              placeholder="e.g. 15"
            />
          </div>
          <div className={styles.col}>
            <label className={styles.sectionLabel} htmlFor="delay-unit">
              Unit
            </label>
            <select
              id="delay-unit"
              value={delayUnit}
              onChange={(e) =>
                setDelayUnit(e.target.value as 'minutes' | 'hours')
              }
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                borderRadius: '0.5rem',
                background: 'var(--color-surface, #020617)',
                border: '1px solid rgba(148,163,184,0.7)',
                color: 'var(--color-text, #e5e7eb)',
                fontSize: '0.875rem',
              }}
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
            </select>
          </div>
        </div>
      )}

      {mode === 'datetime' && (
        <div className={styles.layout}>
          <div className={styles.col}>
            <Input
              label="Send at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <p className={styles.helper}>
              Uses your local timezone and is converted to an absolute instant
              on the server.
            </p>
          </div>
        </div>
      )}

      {scheduleNotification.isError && errorMsg && (
        <div className={styles.errorBanner} role="alert">
          <span>⚠</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {scheduleNotification.isSuccess && (
        <div className={styles.successBanner} role="status">
          <span>✓</span>
          <span>Notification scheduled successfully.</span>
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.status}>
          {scheduleNotification.isPending
            ? 'Scheduling…'
            : 'Select template, customer, and timing, then schedule.'}
        </span>
        <Button
          size="sm"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit() || scheduleNotification.isPending}
          loading={scheduleNotification.isPending}
        >
          {scheduleNotification.isPending
            ? 'Scheduling…'
            : 'Schedule Notification'}
        </Button>
      </div>
    </section>
  );
};
