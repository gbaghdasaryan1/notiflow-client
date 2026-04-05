import { type AxiosError } from 'axios';
import { useState } from 'react';
import type { CreateCustomerPayload } from '@features/customers/types';

import styles from './Customers.module.scss';
import {
  useCreateCustomer,
  useCustomersQuery,
  useDeleteCustomer,
} from '../../use-customer.api';
import { useCustomersStore } from '../../store';
import { CustomerForm, CustomerTable } from '../..';
import DashboardLayout from '@shared/components/layout/dashboard/DashboardLayout';
import Button from '@shared/components/ui/Button';
import { Toast } from '@/shared/components/ui/Toast';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { useToast } from '@/shared/hooks/useToast';

const FORM_ID = 'add-customer-form';

export const Customers = () => {
  const { modalOpen, openModal, closeModal } = useCustomersStore();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  const {
    data: customers = [],
    isLoading,
    isError,
    refetch,
  } = useCustomersQuery();
  const createCustomer = useCreateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [modalError, setModalError] = useState('');

  // ── Derived filtered list ──────────────────────────────────────────────────
  const filtered = search.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase())
      )
    : customers;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreate = async (payload: CreateCustomerPayload) => {
    setModalError('');
    try {
      await createCustomer.mutateAsync(payload);
      closeModal();
      showToast('Customer added successfully.', 'success');
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setModalError(
        e.response?.data?.message ??
          'Failed to create customer. Please try again.'
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
      await deleteCustomer.mutateAsync(id);
      showToast('Customer deleted.', 'success');
    } catch {
      showToast('Failed to delete customer.', 'error');
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
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.titleBlock}>
          <h1>Customers</h1>
          <p>Manage your customer contacts and segments.</p>
        </div>
        <Button size="sm" onClick={handleOpenModal}>
          + Add Customer
        </Button>
      </div>

      {/* ── Notification ──────────────────────────────────────────────────── */}
      <Toast toast={toast} onDismiss={dismissToast} />

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
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
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search customers"
          />
        </div>

        {!isLoading && (
          <span className={styles.count}>
            {filtered.length} {filtered.length === 1 ? 'customer' : 'customers'}
          </span>
        )}
      </div>

      {/* ── Table or fetch error ──────────────────────────────────────────── */}
      {isError ? (
        <div className={styles.fetchError}>
          <span>Failed to load customers.</span>
          <button onClick={() => void refetch()}>Retry</button>
        </div>
      ) : (
        <CustomerTable
          customers={filtered}
          loading={isLoading}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="Add Customer"
        formId={FORM_ID}
        submitting={createCustomer.isPending}
        submitLabel="Add Customer"
        maxWidth="sm"
        apiError={modalError}
      >
        <CustomerForm
          formId={FORM_ID}
          onSubmit={handleCreate}
          disabled={createCustomer.isPending}
        />
      </Modal>

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Delete Customer"
        message={`Delete "${customers.find((c) => c.id === confirmTarget)?.name ?? 'this customer'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deletingId !== null}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setConfirmTarget(null)}
      />
    </DashboardLayout>
  );
};
