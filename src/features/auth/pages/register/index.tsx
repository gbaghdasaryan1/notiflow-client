import { type AxiosError } from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../auth.module.scss';
import { authService } from '../../services';
import { useAuthStore } from '../../store';
import Button from '@shared/components/ui/Button';
import Input from '@shared/components/ui/Input';

interface FieldErrors {
  businessName?: string;
  fullName?: string;
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (fields: {
  businessName: string;
  fullName: string;
  email: string;
  password: string;
}): FieldErrors => {
  const errors: FieldErrors = {};
  if (!fields.businessName.trim())
    errors.businessName = 'Business name is required.';
  if (!fields.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!fields.email) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(fields.email))
    errors.email = 'Enter a valid email address.';
  if (!fields.password) errors.password = 'Password is required.';
  else if (fields.password.length < 8)
    errors.password = 'Password must be at least 8 characters.';
  return errors;
};

export const Register = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setApiError('');

    const errors = validate({
      businessName,
      fullName,
      email: email.trim(),
      password,
    });
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const { data } = await authService.register({
        businessName: businessName.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      });
      setToken(data.access_token);
      navigate('/', { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const status = axiosErr.response?.status;

      if (status === 409) {
        setFieldErrors({ email: 'An account with this email already exists.' });
      } else if (status === 422) {
        setApiError('Please check your details and try again.');
      } else if (!axiosErr.response) {
        setApiError('Unable to reach the server. Check your connection.');
      } else {
        setApiError(
          axiosErr.response.data?.message ??
            'Something went wrong. Please try again.'
        );
      }
    } finally {
      setLoading(false);
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
          <h1>Create your account</h1>
          <p>Start building better notification workflows.</p>
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

          <div className={styles.row}>
            <Input
              label="Business name"
              type="text"
              placeholder="Acme Corp"
              autoComplete="organization"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              error={fieldErrors.businessName}
              disabled={loading}
            />

            <Input
              label="Full name"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={fieldErrors.fullName}
              disabled={loading}
            />
          </div>

          <Input
            label="Work email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            disabled={loading}
          />

          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="+1 555 000 0000"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            disabled={loading}
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

          <Button type="submit" fullWidth loading={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
