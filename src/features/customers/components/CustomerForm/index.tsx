import { useState } from 'react';
import styles from './CustomerForm.module.scss';
import type { CreateCustomerPayload } from '../../types';
import Input from '@shared/components/ui/Input';

type FieldErrors = {
  name?: string;
};

type Props = {
  formId: string;
  onSubmit: (payload: CreateCustomerPayload) => void;
  disabled?: boolean;
};

export const CustomerForm = ({ formId, onSubmit, disabled = false }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const fieldErrors: FieldErrors = {};
    if (!name.trim()) fieldErrors.name = 'Name is required.';
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      name: name.trim(),
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      ...(parsedTags.length ? { tags: parsedTags } : {}),
    });
  };

  return (
    <form
      id={formId}
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
    >
      <Input
        label="Name"
        type="text"
        placeholder="Jane Smith"
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        disabled={disabled}
      />

      <Input
        label="Email (optional)"
        type="email"
        placeholder="jane@company.com"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={disabled}
      />

      <Input
        label="Phone (optional)"
        type="tel"
        placeholder="+1 555 000 0000"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={disabled}
      />

      <div>
        <Input
          label="Tags (optional)"
          type="text"
          placeholder="vip, enterprise, trial"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={disabled}
        />
        <p className={styles.hint}>Separate multiple tags with commas.</p>
      </div>
    </form>
  );
};
