import { BulkNotificationForm } from '@/features/notifications/components/BulkNotificationForm';
import DashboardLayout from '@shared/components/layout/dashboard/DashboardLayout';
import styles from './BulkSend.module.scss';

export const BulkSendNotification = () => (
  <DashboardLayout>
    <div className={styles.pageHeader}>
      <h1>Bulk Send</h1>
      <p>Send one template to many customers in a single operation.</p>
    </div>
    <BulkNotificationForm />
  </DashboardLayout>
);
