import { type AxiosError } from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../auth.module.scss';
import { useLogin } from '../../use-auth.api';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';

type FieldErrors = {
  email?: string;
  password?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (email: string, password: string): FieldErrors => {
  const errors: FieldErrors = {};
  if (!email) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  return errors;
};

export const Login = () => {
  const navigate = useNavigate();
  const login = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');

  const handleSubmit = async () => {
    setApiError('');

    const errors = validate(email.trim(), password);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    try {
      await login.mutateAsync({ email: email.trim(), password });
      navigate('/', { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const status = axiosErr.response?.status;

      if (status === 401) {
        setApiError('Invalid email or password. Please try again.');
      } else if (status === 429) {
        setApiError('Too many attempts. Please wait a moment and try again.');
      } else if (!axiosErr.response) {
        setApiError('Unable to reach the server. Check your connection.');
      } else {
        setApiError(
          axiosErr.response.data?.message ??
            'Something went wrong. Please try again.'
        );
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>N</div>
          <span className={styles.logoText}>Notiflow</span>
        </div>

        <div className={styles.header}>
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue.</p>
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          noValidate
        >
          {apiError && (
            <div className={styles.apiError} role="alert">
              <em className={styles.apiErrorIcon}>⚠</em>
              {apiError}
            </div>
          )}

          <Input
            label="Email address"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            disabled={login.isPending}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            disabled={login.isPending}
            iconRight={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  cursor: 'pointer',
                  pointerEvents: 'all',
                  background: 'none',
                  border: 'none',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            }
          />

          <Button type="submit" fullWidth loading={login.isPending}>
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className={styles.footer}>
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
};
