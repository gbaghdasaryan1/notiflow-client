import { SendForm } from '@/features/notifications';
import styles from './SendNotification.module.scss';
import DashboardLayout from '@shared/components/layout/dashboard/DashboardLayout';

export const SendNotification = () => (
  <DashboardLayout>
    <div className={styles.pageHeader}>
      <h1>Send Notification</h1>
      <p>
        Select a template and recipient, fill variables, and send in one click.
      </p>
    </div>
    <SendForm />
  </DashboardLayout>
);
