import { useMemo, useState } from 'react';

import styles from './SchedulerForm.module.scss';
import type { Customer } from '@features/customers/types';
import { useCustomersQuery } from '@features/customers/use-customer.api';
import { CustomerSelector, TemplateSelector } from '@features/notifications';
import type {
  CreateRecurringJobPayload,
  RecurrenceType,
  IntervalUnit,
} from '../../types';
import { useTemplatesQuery, type Template } from '@/features/templates';
import Input from '@/shared/components/ui/Input';

type Props = {
  formId: string;
  disabled: boolean;
  onSubmit: (payload: CreateRecurringJobPayload) => void;
};

type FieldErrors = {
  template?: string;
  customer?: string;
  timeOfDay?: string;
  dayOfWeek?: string;
  dayOfMonth?: string;
  intervalValue?: string;
};

const weekdays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const SchedulerForm = ({ formId, disabled, onSubmit }: Props) => {
  const { data: customers = [], isLoading: customersLoading } =
    useCustomersQuery();
  const { data: templates = [], isLoading: templatesLoading } =
    useTemplatesQuery();

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [type, setType] = useState<RecurrenceType>('daily');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number | ''>('');
  const [dayOfMonth, setDayOfMonth] = useState<number | ''>('');
  const [intervalValue, setIntervalValue] = useState('');
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>('minutes');
  const [errors, setErrors] = useState<FieldErrors>({});

  const intervalPreview = useMemo(() => {
    if (!intervalValue || Number.isNaN(Number(intervalValue))) return '';
    const v = Number(intervalValue);
    if (v <= 0) return '';
    const label = v === 1 ? intervalUnit.slice(0, -1) : intervalUnit;
    return `Every ${v} ${label}`;
  }, [intervalUnit, intervalValue]);

  const humanPreview = useMemo(() => {
    if (type === 'interval') return intervalPreview;
    if (!timeOfDay) return '';
    if (type === 'daily') return `Every day at ${timeOfDay}`;
    if (type === 'weekly') {
      if (dayOfWeek === '') return '';
      return `Every ${weekdays[dayOfWeek]} at ${timeOfDay}`;
    }
    if (type === 'monthly') {
      if (dayOfMonth === '') return '';
      return `On day ${dayOfMonth} each month at ${timeOfDay}`;
    }
    return '';
  }, [type, timeOfDay, dayOfWeek, dayOfMonth, intervalPreview]);

  const toIntervalMs = (value: number, unit: IntervalUnit) => {
    if (unit === 'minutes') return value * 60_000;
    if (unit === 'hours') return value * 60 * 60_000;
    return value * 24 * 60 * 60_000;
  };

  const validateAndSubmit = () => {
    const nextErrors: FieldErrors = {};

    if (!selectedTemplate) nextErrors.template = 'Template is required.';
    if (!selectedCustomer) nextErrors.customer = 'Customer is required.';

    if (type !== 'interval' && !timeOfDay) {
      nextErrors.timeOfDay = 'Time is required for this schedule type.';
    }

    if (type === 'weekly' && dayOfWeek === '') {
      nextErrors.dayOfWeek = 'Select a day of the week.';
    }

    if (type === 'monthly') {
      if (dayOfMonth === '') {
        nextErrors.dayOfMonth = 'Day of month is required.';
      } else if (dayOfMonth < 1 || dayOfMonth > 31) {
        nextErrors.dayOfMonth = 'Day must be between 1 and 31.';
      }
    }

    if (type === 'interval') {
      const v = Number(intervalValue);
      if (!intervalValue || Number.isNaN(v)) {
        nextErrors.intervalValue = 'Enter an interval.';
      } else if (v <= 0) {
        nextErrors.intervalValue = 'Interval must be greater than 0.';
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateRecurringJobPayload = {
      templateId: selectedTemplate!.id,
      customerId: selectedCustomer!.id,
      type,
    };

    if (type === 'interval') {
      const ms = toIntervalMs(Number(intervalValue), intervalUnit);
      payload.intervalMs = ms;
    } else {
      payload.timeOfDay = timeOfDay;
      if (type === 'weekly') {
        payload.dayOfWeek = dayOfWeek as number;
      }
      if (type === 'monthly') {
        payload.dayOfMonth = dayOfMonth as number;
      }
    }

    onSubmit(payload);
  };

  const isInvalid = Object.keys(errors).length > 0;

  return (
    <form
      id={formId}
      className={styles.formLayout}
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled) validateAndSubmit();
      }}
    >
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={styles.sectionTitle}>Template</div>
          <TemplateSelector
            templates={templates}
            loading={templatesLoading}
            value={selectedTemplate}
            onChange={(t) => {
              setSelectedTemplate(t);
              setErrors((e) => ({ ...e, template: undefined }));
            }}
            error={errors.template}
          />
        </div>
        <div className={styles.col}>
          <div className={styles.sectionTitle}>Customer</div>
          <CustomerSelector
            customers={customers}
            loading={customersLoading}
            value={selectedCustomer}
            onChange={(c) => {
              setSelectedCustomer(c);
              setErrors((e) => ({ ...e, customer: undefined }));
            }}
            error={errors.customer}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.col}>
          <div className={styles.sectionTitle}>Type</div>
          <div className={styles.typeTabs}>
            {(
              ['daily', 'weekly', 'monthly', 'interval'] as RecurrenceType[]
            ).map((t) => (
              <button
                key={t}
                type="button"
                className={`${styles.typeTab} ${type === t ? 'active' : ''}`}
                onClick={() => {
                  setType(t);
                  setErrors({});
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className={styles.helper}>
            Choose how often this automation should run.
          </div>
        </div>
      </div>

      {type !== 'interval' && (
        <div className={styles.row}>
          {type === 'weekly' && (
            <div className={styles.col}>
              <Input
                // as={undefined as never}
                label="Day of week"
                list="scheduler-days"
                value={dayOfWeek === '' ? '' : weekdays[dayOfWeek]}
                onChange={(e) => {
                  const idx = weekdays.indexOf(
                    e.target.value as (typeof weekdays)[number]
                  );
                  setDayOfWeek(idx === -1 ? '' : idx);
                  setErrors((er) => ({ ...er, dayOfWeek: undefined }));
                }}
                placeholder="e.g. Monday"
                disabled={disabled}
                error={errors.dayOfWeek}
              />
              <datalist id="scheduler-days">
                {weekdays.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          )}

          {type === 'monthly' && (
            <div className={styles.col}>
              <Input
                label="Day of month"
                type="number"
                min={1}
                max={31}
                value={dayOfMonth === '' ? '' : String(dayOfMonth)}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  setDayOfMonth(v);
                  setErrors((er) => ({ ...er, dayOfMonth: undefined }));
                }}
                placeholder="1-31"
                disabled={disabled}
                error={errors.dayOfMonth}
              />
            </div>
          )}

          <div className={styles.col}>
            <Input
              label="Time of day"
              type="time"
              value={timeOfDay}
              onChange={(e) => {
                setTimeOfDay(e.target.value);
                setErrors((er) => ({ ...er, timeOfDay: undefined }));
              }}
              disabled={disabled}
              error={errors.timeOfDay}
            />
          </div>
        </div>
      )}

      {type === 'interval' && (
        <div className={styles.row}>
          <div className={styles.col}>
            <Input
              label="Every"
              type="number"
              min={1}
              value={intervalValue}
              onChange={(e) => {
                setIntervalValue(e.target.value);
                setErrors((er) => ({ ...er, intervalValue: undefined }));
              }}
              disabled={disabled}
              error={errors.intervalValue}
            />
          </div>
          <div className={styles.col}>
            <label className={styles.sectionTitle} htmlFor="interval-unit">
              Unit
            </label>
            <select
              id="interval-unit"
              value={intervalUnit}
              onChange={(e) => setIntervalUnit(e.target.value as IntervalUnit)}
              disabled={disabled}
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
              <option value="days">Days</option>
            </select>
          </div>
          {intervalPreview && (
            <div className={styles.col}>
              <div className={styles.previewChip}>{intervalPreview}</div>
            </div>
          )}
        </div>
      )}

      {humanPreview && <div className={styles.previewChip}>{humanPreview}</div>}

      {/* Keep submit button in modal footer; here we just ensure validity on submit. */}
      {isInvalid && (
        <span style={{ fontSize: '0.75rem', color: '#f87171' }}>
          Please fix the highlighted fields above.
        </span>
      )}
    </form>
  );
};
