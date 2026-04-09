import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@features/auth';
import styles from './InboxLayout.module.scss';

type Props = {
  children: ReactNode;
};

const NAV = [
  {
    to: '/meta/inbox',
    label: 'Inbox',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M2 3h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M1 4l7 5 7-5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/meta/accounts',
    label: 'Connected Accounts',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export const InboxLayout = ({ children }: Props) => {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <NavLink to="/" className={styles.brand}>
          <div className={styles.logoMark}>N</div>
          <span className={styles.logoText}>Notiflow</span>
        </NavLink>

        <nav className={styles.nav}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={false}
              className={({ isActive }) =>
                [styles.navItem, isActive ? styles.active : ''].filter(Boolean).join(' ')
              }
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.bottom}>
          <NavLink to="/settings" className={styles.navItem}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
              <path
                d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            className={styles.logoutBtn}
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <path
                d="M10 11l3-3-3-3M13 8H6"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
};
