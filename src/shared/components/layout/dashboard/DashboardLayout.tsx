import type { ReactNode } from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './DashboardLayout.module.scss';
import { useAuthStore } from '@features/auth';
import Button from '@shared/components/ui/Button';

const NAV = [
  { label: 'Overview', to: '/', end: true },
  { label: 'Customers', to: '/customers', end: false },
  { label: 'Templates', to: '/templates', end: false },
  { label: 'Send', to: '/send', end: true },
  { label: 'Bulk Send', to: '/send/bulk', end: false },
  { label: 'Scheduler', to: '/scheduler', end: false },
  { label: 'Messages',  to: '/meta/dms',  end: false },
  { label: 'Analytics', to: '/analytics', end: false },
  { label: 'Settings', to: '/settings', end: false },
];

type Props = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  const logout = useAuthStore((s) => s.logout);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <NavLink to="/" className={styles.brand}>
          <div className={styles.logoMark}>N</div>
          <span className={styles.logoText}>Notiflow</span>
        </NavLink>

        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setNavOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={navOpen}
        >
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
        </button>

        <nav className={`${styles.nav} ${navOpen ? styles.navOpen : ''}`}>
          {NAV.map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [styles.navItem, isActive ? styles.active : '']
                  .filter(Boolean)
                  .join(' ')
              }
              onClick={() => setNavOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setNavOpen(false);
              logout();
            }}
            className={styles.signOutBtn}
          >
            Sign out
          </Button>
        </nav>
      </header>

      {navOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default DashboardLayout;
