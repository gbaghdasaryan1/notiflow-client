import { type AxiosError } from 'axios';
import { useState } from 'react';

import styles from './Templates.module.scss';
import { TemplateTable } from '../../components/TemplateTable';
import { TemplateForm } from '../../components/TemplateForm';
import { useTemplatesStore } from '../../store';
import type { CreateTemplatePayload } from '../../types';
import {
  useTemplatesQuery,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from '../../use-templates.api';
import DashboardLayout from '@/shared/components/layout/dashboard/DashboardLayout';
import Button from '@/shared/components/ui/Button';
import { Toast } from '@/shared/components/ui/Toast';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { useToast } from '@/shared/hooks/useToast';

const FORM_ID = 'template-form';
type ChannelFilter = 'all' | 'email' | 'sms';

export const Templates = () => {
  const {
    modalOpen,
    modalMode,
    editingTemplate,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useTemplatesStore();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  const {
    data: templates = [],
    isLoading,
    isError,
    refetch,
  } = useTemplatesQuery();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState<ChannelFilter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [modalError, setModalError] = useState('');

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = templates.filter((t) => {
    const matchesSearch =
      !search.trim() ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = channel === 'all' || t.channel === channel;
    return matchesSearch && matchesChannel;
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSave = async (payload: CreateTemplatePayload) => {
    setModalError('');
    const isEdit = modalMode === 'edit';
    try {
      if (isEdit && editingTemplate) {
        await updateTemplate.mutateAsync({ id: editingTemplate.id, payload });
        showToast('Template updated successfully.', 'success');
      } else {
        await createTemplate.mutateAsync(payload);
        showToast('Template created successfully.', 'success');
      }
      closeModal();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setModalError(
        e.response?.data?.message ??
          (isEdit
            ? 'Failed to update template. Please try again.'
            : 'Failed to create template. Please try again.')
      );
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
      await deleteTemplate.mutateAsync(id);
      showToast('Template deleted.', 'success');
    } catch {
      showToast('Failed to delete template.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenCreate = () => {
    setModalError('');
    openCreateModal();
  };

  const handleOpenEdit = (template: Parameters<typeof openEditModal>[0]) => {
    setModalError('');
    openEditModal(template);
  };

  const submitting = createTemplate.isPending || updateTemplate.isPending;
  const isEdit = modalMode === 'edit';

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleBlock}>
          <h1>Templates</h1>
          <p>
            Build and manage reusable message templates with dynamic variables.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          + Create Template
        </Button>
      </div>

      {/* Toast */}
      <Toast toast={toast} onDismiss={dismissToast} />

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <circle
                cx="6"
                cy="6"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M9.5 9.5L13 13"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search templates"
          />
        </div>

        <div className={styles.filterGroup}>
          {(['all', 'email', 'sms'] as const).map((f) => (
            <button
              key={f}
              className={`${styles.filterPill} ${channel === f ? styles.active : ''}`}
              onClick={() => setChannel(f)}
            >
              {f === 'all' ? 'All' : f === 'email' ? 'Email' : 'SMS'}
            </button>
          ))}
        </div>

        {!isLoading && (
          <span className={styles.count}>
            {filtered.length} {filtered.length === 1 ? 'template' : 'templates'}
          </span>
        )}
      </div>

      {/* Table or error */}
      {isError ? (
        <div className={styles.fetchError}>
          <span>Failed to load templates.</span>
          <button onClick={() => void refetch()}>Retry</button>
        </div>
      ) : (
        <TemplateTable
          templates={filtered}
          loading={isLoading}
          deletingId={deletingId}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal — key forces re-mount (and fresh state) when switching create↔edit */}
      <Modal
        key={isEdit ? `edit-${editingTemplate?.id}` : 'create'}
        isOpen={modalOpen}
        onClose={closeModal}
        title={isEdit ? 'Edit Template' : 'Create Template'}
        subtitle={
          isEdit
            ? `Editing "${editingTemplate?.name}"`
            : 'New reusable message template'
        }
        formId={FORM_ID}
        submitting={submitting}
        submitLabel={isEdit ? 'Save Changes' : 'Create Template'}
        apiError={modalError}
      >
        <TemplateForm
          formId={FORM_ID}
          initialData={isEdit ? (editingTemplate ?? undefined) : undefined}
          onSubmit={handleSave}
          disabled={submitting}
        />
      </Modal>

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Delete Template"
        message={`Delete "${templates.find((t) => t.id === confirmTarget)?.name ?? 'this template'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deletingId !== null}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setConfirmTarget(null)}
      />
    </DashboardLayout>
  );
};
