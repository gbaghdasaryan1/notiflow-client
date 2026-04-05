import { type AxiosError } from 'axios';
import { useState } from 'react';

import { parseContentParts } from '@lib/template-variables';
import type { Customer } from '@features/customers/types';
import styles from './SendForm.module.scss';
import { useCustomersQuery } from '@features/customers/use-customer.api';
import { prefillFromCustomer, VariablesForm } from '../VariablesForm';
import { TemplateSelector } from '../TemplateSelector';
import { CustomerSelector } from '../CustomerSelector';
import { useSendNotification } from '../../use-notifications.api';
import { useTemplatesQuery, type Template } from '@/features/templates';
import Button from '@shared/components/ui/Button';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getChannelLabel = (ch: string) => (ch === 'email' ? 'Email' : 'SMS');

const getRecipientAddress = (customer: Customer | null, channel: string) => {
  if (!customer) return '';
  return channel === 'email' ? (customer.email ?? '') : (customer.phone ?? '');
};

// ── Preview component ─────────────────────────────────────────────────────────
const LivePreview = ({
  template,
  customer,
  values,
}: {
  template: Template | null;
  customer: Customer | null;
  values: Record<string, string>;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!template) return;
    const text = template.content.replace(
      /\{\{(\w+)\}\}/g,
      (_, k) => values[k] ?? `{{${k}}}`
    );
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const parts = template ? parseContentParts(template.content, values) : [];
  const totalVars = template?.variables.length ?? 0;
  const filledVars =
    totalVars > 0
      ? template!.variables.filter((v) => values[v]?.trim()).length
      : 0;
  const progress = totalVars > 0 ? (filledVars / totalVars) * 100 : 100;

  return (
    <div className={styles.previewCard}>
      <div className={styles.previewHeader}>
        <span className={styles.previewTitle}>
          <span className={styles.flashIcon}>⚡</span>
          Live Preview
        </span>
        <button
          className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          disabled={!template}
        >
          {copied ? '✓ Copied' : '⧉ Copy'}
        </button>
      </div>

      {(template || customer) && (
        <div className={styles.recipientBar}>
          {template && (
            <div className={styles.recipientRow}>
              <span className={styles.recipientLabel}>Channel</span>
              <span
                className={`${styles.channelBadge} ${styles[template.channel]}`}
              >
                {getChannelLabel(template.channel)}
              </span>
            </div>
          )}
          {customer && (
            <div className={styles.recipientRow}>
              <span className={styles.recipientLabel}>To</span>
              <span className={styles.recipientValue}>
                {customer.name}
                {template &&
                  getRecipientAddress(customer, template.channel) &&
                  ` · ${getRecipientAddress(customer, template.channel)}`}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={styles.previewBody}>
        {!template ? (
          <div className={styles.previewEmpty}>
            <span className={styles.emptyIcon}>📋</span>
            <span>Select a template to see the preview</span>
          </div>
        ) : (
          <div className={styles.previewContent}>
            {parts.map((part, i) => {
              if (part.kind === 'text')
                return <span key={i}>{part.value}</span>;
              if (part.kind === 'filled')
                return (
                  <span key={i} className={styles.varFilled}>
                    {part.value}
                  </span>
                );
              return (
                <span
                  key={i}
                  className={styles.varUnfilled}
                >{`{{${part.varName}}}`}</span>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.previewFooter}>
        <span className={styles.fillStatus}>
          <strong>{filledVars}</strong> / {totalVars} variables filled
        </span>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
type FieldErrors = { template?: string; customer?: string };

export const SendForm = () => {
  const { data: templates = [], isLoading: tLoading } = useTemplatesQuery();
  const { data: customers = [], isLoading: cLoading } = useCustomersQuery();
  const sendNotification = useSendNotification();

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [sentInfo, setSentInfo] = useState<{
    template: string;
    customer: string;
    channel: string;
  } | null>(null);

  const handleTemplateChange = (template: Template) => {
    setSelectedTemplate(template);
    setFieldErrors((e) => ({ ...e, template: undefined }));
    // Rebuild variable values for the new template, pre-filling from current customer
    setVariableValues(
      prefillFromCustomer(template.variables, selectedCustomer)
    );
  };

  const handleCustomerChange = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFieldErrors((e) => ({ ...e, customer: undefined }));
    // Merge customer-derived values into existing variable values (only fill empty fields)
    if (selectedTemplate) {
      const derived = prefillFromCustomer(selectedTemplate.variables, customer);
      setVariableValues((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(derived)) {
          if (!next[k]) next[k] = v as string;
        }
        return next;
      });
    }
  };

  const handleVarChange = (key: string, val: string) => {
    setVariableValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSend = async () => {
    const errors: FieldErrors = {};
    if (!selectedTemplate) errors.template = 'Please select a template.';
    if (!selectedCustomer) errors.customer = 'Please select a customer.';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setErrorMsg('');

    try {
      await sendNotification.mutateAsync({
        templateId: selectedTemplate!.id,
        customerId: selectedCustomer!.id,
        data: Object.fromEntries(
          Object.entries(variableValues).filter(([, v]) => v.trim() !== '')
        ),
      });

      setSentInfo({
        template: selectedTemplate!.name,
        customer: selectedCustomer!.name,
        channel: getChannelLabel(selectedTemplate!.channel),
      });
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setErrorMsg(
        e.response?.data?.message ??
          'Failed to send notification. Please try again.'
      );
    }
  };

  const handleReset = () => {
    setSelectedTemplate(null);
    setSelectedCustomer(null);
    setVariableValues({});
    setFieldErrors({});
    setErrorMsg('');
    setSentInfo(null);
    sendNotification.reset();
  };

  // ── Step states ─────────────────────────────────────────────────────────────
  const step1 = selectedTemplate ? 'done' : 'active';
  const step2 = selectedCustomer
    ? 'done'
    : selectedTemplate
      ? 'active'
      : 'locked';
  const step3 = selectedTemplate && selectedCustomer ? 'active' : 'locked';

  if (sendNotification.isSuccess && sentInfo) {
    return (
      <div className={styles.successScreen}>
        <div className={styles.successIcon}>✓</div>
        <h2>Notification Sent!</h2>
        <p>
          Your message has been dispatched and is on its way to the recipient.
        </p>
        <div className={styles.successMeta}>
          {[
            { label: 'Template', value: sentInfo.template },
            { label: 'Recipient', value: sentInfo.customer },
            { label: 'Channel', value: sentInfo.channel },
          ].map((m) => (
            <div key={m.label} className={styles.successMetaItem}>
              <span className={styles.metaLabel}>{m.label}</span>
              <span className={styles.metaValue}>{m.value}</span>
            </div>
          ))}
        </div>
        <Button onClick={handleReset}>Send Another</Button>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* ── Left: steps ─────────────────────────────────────────────────── */}
      <div className={styles.steps}>
        {/* Step 1 — Template */}
        <div className={`${styles.stepCard} ${styles[step1]}`}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNum}>{step1 === 'done' ? '✓' : '1'}</div>
            <span className={styles.stepTitle}>Choose Template</span>
            {step1 === 'done' && (
              <span className={styles.stepStatus}>
                ✓ {selectedTemplate!.name}
              </span>
            )}
          </div>
          <div className={styles.stepBody}>
            <TemplateSelector
              templates={templates}
              loading={tLoading}
              value={selectedTemplate}
              onChange={handleTemplateChange}
              error={fieldErrors.template}
            />
            {fieldErrors.template && (
              <div className={styles.fieldError}>{fieldErrors.template}</div>
            )}
          </div>
        </div>

        {/* Step 2 — Customer */}
        <div className={`${styles.stepCard} ${styles[step2]}`}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNum}>{step2 === 'done' ? '✓' : '2'}</div>
            <span className={styles.stepTitle}>Choose Recipient</span>
            {step2 === 'done' && (
              <span className={styles.stepStatus}>
                ✓ {selectedCustomer!.name}
              </span>
            )}
          </div>
          <div className={styles.stepBody}>
            <CustomerSelector
              customers={customers}
              loading={cLoading}
              value={selectedCustomer}
              onChange={handleCustomerChange}
              error={fieldErrors.customer}
            />
            {fieldErrors.customer && (
              <div className={styles.fieldError}>{fieldErrors.customer}</div>
            )}
          </div>
        </div>

        {/* Step 3 — Variables */}
        <div className={`${styles.stepCard} ${styles[step3]}`}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNum}>3</div>
            <span className={styles.stepTitle}>Fill Variables</span>
            {selectedTemplate && selectedTemplate.variables.length === 0 && (
              <span className={styles.stepStatus}>✓ No variables needed</span>
            )}
          </div>
          <div className={styles.stepBody}>
            <VariablesForm
              variables={selectedTemplate?.variables ?? []}
              values={variableValues}
              customer={selectedCustomer}
              onChange={handleVarChange}
              disabled={sendNotification.isPending}
            />
          </div>
        </div>

        {/* Error + Send */}
        {sendNotification.isError && errorMsg && (
          <div className={styles.errorBanner} role="alert">
            <em style={{ fontStyle: 'normal' }}>⚠</em>
            {errorMsg}
          </div>
        )}

        <div className={styles.sendRow}>
          <span className={styles.sendHint}>
            {!selectedTemplate || !selectedCustomer
              ? 'Complete all steps to send'
              : 'Ready to send'}
          </span>
          <Button
            size="lg"
            loading={sendNotification.isPending}
            disabled={
              !selectedTemplate ||
              !selectedCustomer ||
              sendNotification.isPending
            }
            onClick={() => void handleSend()}
          >
            {sendNotification.isPending ? 'Sending…' : 'Send Notification'}
          </Button>
        </div>
      </div>

      {/* ── Right: preview ───────────────────────────────────────────────── */}
      <LivePreview
        template={selectedTemplate}
        customer={selectedCustomer}
        values={variableValues}
      />
    </div>
  );
};
