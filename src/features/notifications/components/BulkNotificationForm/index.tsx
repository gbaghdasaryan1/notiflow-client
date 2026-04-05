import { useState } from 'react';
import { type AxiosError } from 'axios';

import type { Customer } from '@features/customers/types';
import { useCustomersQuery } from '@features/customers/use-customer.api';
import { useTemplatesQuery, type Template } from '@/features/templates';
import { TemplateSelector } from '../TemplateSelector';
import { useSendBulkNotification } from '../../use-notifications.api';
import { notificationsApiService } from '../../services/api-services';
import type { BulkSendResponse, FieldErrors } from '../../types';
import { ResultsPanel } from '../ResultsPanel';
import Button from '@shared/components/ui/Button';
import styles from './BulkNotificationForm.module.scss';
import { BulkCustomerPicker } from '../BulkCustomerPicker';
import {
  initVariableConfigs,
  BulkVariablesForm,
  type VariableConfig,
} from '../BulkVariablesForm';
import { resolveData } from '@features/notifications/helpers';

export const BulkNotificationForm = () => {
  const { data: templates = [], isLoading: tLoading } = useTemplatesQuery();
  const { data: customers = [], isLoading: cLoading } = useCustomersQuery();
  const sendBulk = useSendBulkNotification();

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [variableConfigs, setVariableConfigs] = useState<
    Record<string, VariableConfig>
  >({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [results, setResults] = useState<BulkSendResponse | null>(null);

  const isLoading = isSending || sendBulk.isPending;

  const handleTemplateChange = (template: Template) => {
    setSelectedTemplate(template);
    setFieldErrors((e) => ({ ...e, template: undefined }));
    setVariableConfigs(initVariableConfigs(template.variables));
  };

  const handleCustomersChange = (next: Customer[]) => {
    setSelectedCustomers(next);
    if (next.length > 0)
      setFieldErrors((e) => ({ ...e, customers: undefined }));
  };

  const handleVarConfig = (key: string, config: VariableConfig) => {
    setVariableConfigs((prev) => ({ ...prev, [key]: config }));
  };

  const handleSend = async () => {
    const errors: FieldErrors = {};
    if (!selectedTemplate) errors.template = 'Please select a template.';
    if (selectedCustomers.length === 0)
      errors.customers = 'Please select at least one customer.';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setErrorMsg('');

    const hasCustomerMappings = Object.values(variableConfigs).some(
      (c) => c.mode === 'customer'
    );

    try {
      if (!hasCustomerMappings) {
        // All static values — single bulk request
        const data = resolveData(variableConfigs, {} as Customer);
        const response = await sendBulk.mutateAsync({
          templateId: selectedTemplate!.id,
          customerIds: selectedCustomers.map((c) => c.id),
          data,
        });
        setResults(response);
      } else {
        // Per-customer variable resolution — parallel individual sends
        setIsSending(true);
        const settled = await Promise.allSettled(
          selectedCustomers.map((customer) =>
            notificationsApiService.send({
              templateId: selectedTemplate!.id,
              customerId: customer.id,
              data: resolveData(variableConfigs, customer),
            })
          )
        );
        setResults({
          success: settled.every((r) => r.status === 'fulfilled'),
          results: settled.map((r, i) => ({
            customerId: selectedCustomers[i].id,
            status: r.status === 'fulfilled' ? r.value.data.status : 'failed',
            error:
              r.status === 'rejected'
                ? ((r.reason as AxiosError<{ message?: string }>).response?.data
                    ?.message ?? 'Send failed')
                : undefined,
          })),
        });
      }
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setErrorMsg(
        e.response?.data?.message ??
          'Failed to send notifications. Please try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setSelectedTemplate(null);
    setSelectedCustomers([]);
    setVariableConfigs({});
    setFieldErrors({});
    setErrorMsg('');
    setResults(null);
    sendBulk.reset();
  };

  const step1 = selectedTemplate ? 'done' : 'active';
  const step2 =
    selectedCustomers.length > 0
      ? 'done'
      : selectedTemplate
        ? 'active'
        : 'locked';
  const step3 =
    selectedTemplate && selectedCustomers.length > 0 ? 'active' : 'locked';

  if (results) {
    return (
      <ResultsPanel
        results={results.results}
        customers={customers}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className={styles.steps}>
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

      <div className={`${styles.stepCard} ${styles[step2]}`}>
        <div className={styles.stepHeader}>
          <div className={styles.stepNum}>{step2 === 'done' ? '✓' : '2'}</div>
          <span className={styles.stepTitle}>Choose Recipients</span>
          {step2 === 'done' && (
            <span className={styles.stepStatus}>
              ✓ {selectedCustomers.length} customer
              {selectedCustomers.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        <div className={styles.stepBody}>
          <BulkCustomerPicker
            customers={customers}
            loading={cLoading}
            selected={selectedCustomers}
            onChange={handleCustomersChange}
            error={fieldErrors.customers}
          />
          {fieldErrors.customers && (
            <div className={styles.fieldError}>{fieldErrors.customers}</div>
          )}
        </div>
      </div>

      <div className={`${styles.stepCard} ${styles[step3]}`}>
        <div className={styles.stepHeader}>
          <div className={styles.stepNum}>3</div>
          <span className={styles.stepTitle}>Configure Variables</span>
          {selectedTemplate?.variables.length === 0 && (
            <span className={styles.stepStatus}>✓ No variables needed</span>
          )}
        </div>
        <div className={styles.stepBody}>
          <BulkVariablesForm
            variables={selectedTemplate?.variables ?? []}
            configs={variableConfigs}
            onChange={handleVarConfig}
            disabled={isLoading}
          />
        </div>
      </div>

      {(sendBulk.isError || errorMsg) && (
        <div className={styles.errorBanner} role="alert">
          <em style={{ fontStyle: 'normal' }}>⚠</em> {errorMsg}
        </div>
      )}

      <div className={styles.sendRow}>
        <span className={styles.sendHint}>
          {!selectedTemplate || selectedCustomers.length === 0
            ? 'Complete all steps to send'
            : `Ready to send to ${selectedCustomers.length} recipient${selectedCustomers.length !== 1 ? 's' : ''}`}
        </span>
        <Button
          size="lg"
          loading={isLoading}
          disabled={
            !selectedTemplate || selectedCustomers.length === 0 || isLoading
          }
          onClick={() => void handleSend()}
        >
          {isLoading
            ? 'Sending…'
            : `Send to ${selectedCustomers.length || '—'} Recipient${selectedCustomers.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
};
