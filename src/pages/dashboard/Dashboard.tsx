import DashboardLayout from '@/shared/components/layout/dashboard/DashboardLayout';
import styles from './Dashboard.module.scss';

const stats = [
  { label: 'Notifications Sent', value: '0', delta: '+0% this week' },
  { label: 'Active Flows', value: '0', delta: '+0% this week' },
  { label: 'Delivery Rate', value: '—', delta: 'No data yet' },
  { label: 'Subscribers', value: '0', delta: '+0 this week' },
];

const Dashboard = () => (
  <DashboardLayout>
    <div className={styles.pageHeader}>
      <h1>Overview</h1>
      <p>Welcome to Notiflow — your notification workflow platform.</p>
    </div>

    <div className={styles.statsGrid}>
      {stats.map((s) => (
        <div key={s.label} className={styles.statCard}>
          <div className={styles.statLabel}>{s.label}</div>
          <div className={styles.statValue}>{s.value}</div>
          <div className={styles.statDelta}>{s.delta}</div>
        </div>
      ))}
    </div>

    <div className={styles.placeholder}>
      Flow builder and analytics panels will appear here.
    </div>
  </DashboardLayout>
);

export default Dashboard;
