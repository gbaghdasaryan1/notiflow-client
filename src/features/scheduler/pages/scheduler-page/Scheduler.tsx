import { type AxiosError } from 'axios';
import { useState } from 'react';
import styles from './Scheduler.module.scss';
import { OneOffScheduler } from '../../components/OneOffScheduler';
import { SchedulerTable } from '../../components/SchedulerTable';
import { SchedulerForm } from '../../components/SchedulerForm';
import {
  useCreateJob,
  useDeleteJob,
  useSchedulerJobsQuery,
  useUpdateJob,
} from '../../use-scheduler.api';
import { useSchedulerStore } from '../../store';
import type { CreateRecurringJobPayload } from '../../types';
import DashboardLayout from '@/shared/components/layout/dashboard/DashboardLayout';
import Button from '@/shared/components/ui/Button';
import { Toast } from '@/shared/components/ui/Toast';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { useToast } from '@/shared/hooks/useToast';

const FORM_ID = 'scheduler-form';

export const Scheduler = () => {
  const { modalOpen, openModal, closeModal } = useSchedulerStore();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  const { data: jobs = [], isLoading } = useSchedulerJobsQuery();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const [modalError, setModalError] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  const handleCreate = async (payload: CreateRecurringJobPayload) => {
    setModalError('');
    try {
      await createJob.mutateAsync(payload);
      closeModal();
      showToast('Automation created successfully.', 'success');
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setModalError(
        e.response?.data?.message ??
          'Failed to create automation. Please try again.'
      );
    }
  };

  const handleToggle = async (id: string, nextActive: boolean) => {
    setTogglingId(id);
    try {
      await updateJob.mutateAsync({ id, payload: { isActive: nextActive } });
      showToast(
        nextActive ? 'Automation enabled.' : 'Automation paused.',
        'success'
      );
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      showToast(
        e.response?.data?.message ?? 'Failed to update automation.',
        'error'
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmTarget(id);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    const id = confirmTarget;
    setConfirmTarget(null);
    setDeletingId(id);
    try {
      await deleteJob.mutateAsync(id);
      showToast('Automation deleted.', 'success');
    } catch {
      showToast('Failed to delete automation.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenModal = () => {
    setModalError('');
    openModal();
  };

  return (
    <DashboardLayout>
      <div className={styles.pageHeader}>
        <div className={styles.titleBlock}>
          <h1>Automation / Scheduler</h1>
          <p>Create and manage recurring notification jobs.</p>
        </div>
        <Button size="sm" onClick={handleOpenModal}>
          + Create Automation
        </Button>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      <div className={styles.toolbar}>
        <div className={styles.left}>
          <span className={styles.label}>Automation Overview</span>
          <span className={styles.hint}>
            {isLoading
              ? 'Loading automations…'
              : `${jobs.length} ${jobs.length === 1 ? 'active rule' : 'rules configured'}`}
          </span>
        </div>
      </div>

      {/* One-off scheduling panel */}
      <OneOffScheduler />

      <SchedulerTable
        jobs={jobs}
        loading={isLoading}
        onToggle={handleToggle}
        onDelete={handleDelete}
        togglingId={togglingId}
        deletingId={deletingId}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="Create Automation"
        subtitle="Define when and how notifications should be sent automatically."
        badge="Automation"
        formId={FORM_ID}
        submitting={createJob.isPending}
        submitLabel="Create Automation"
        maxWidth="lg"
        apiError={modalError}
      >
        <SchedulerForm
          formId={FORM_ID}
          disabled={createJob.isPending}
          onSubmit={handleCreate}
        />
      </Modal>

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Delete Automation"
        message="Delete this automation? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deletingId !== null}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setConfirmTarget(null)}
      />
    </DashboardLayout>
  );
};
