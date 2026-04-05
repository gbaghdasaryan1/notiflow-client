import { useState } from 'react';
import { extractVariables, renderPreview } from '@lib/template-variables';
import styles from './TemplateForm.module.scss';
import type { Template, CreateTemplatePayload, TemplateChannel } from '../../types';

type FieldErrors = {
  name?:    string;
  content?: string;
};

type Props = {
  formId:       string;
  initialData?: Template;
  onSubmit:     (payload: CreateTemplatePayload) => void;
  disabled?:    boolean;
};

export const TemplateForm = ({ formId, initialData, onSubmit, disabled = false }: Props) => {
  const [name,       setName]       = useState(initialData?.name    ?? '');
  const [channel,    setChannel]    = useState<TemplateChannel>(initialData?.channel ?? 'email');
  const [content,    setContent]    = useState(initialData?.content ?? '');
  const [manualVars, setManualVars] = useState<string[]>(
    initialData?.variables.filter((v) => !extractVariables(initialData.content).includes(v)) ?? [],
  );
  const [varInput,   setVarInput]   = useState('');
  const [errors,     setErrors]     = useState<FieldErrors>({});
  const [copied,     setCopied]     = useState(false);

  // Auto-detected + manual, deduped
  const detectedVars = extractVariables(content);
  const allVars      = Array.from(new Set([...detectedVars, ...manualVars]));
  const previewText  = renderPreview(content);

  const handleAddVar = () => {
    const v = varInput.trim().replace(/[^a-zA-Z0-9_]/g, '');
    if (!v || allVars.includes(v)) { setVarInput(''); return; }
    setManualVars((prev) => [...prev, v]);
    setVarInput('');
  };

  const handleRemoveManualVar = (v: string) => {
    setManualVars((prev) => prev.filter((x) => x !== v));
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const fieldErrors: FieldErrors = {};
    if (!name.trim())    fieldErrors.name    = 'Name is required.';
    if (!content.trim()) fieldErrors.content = 'Content is required.';
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    setErrors({});

    onSubmit({
      name:      name.trim(),
      channel,
      content:   content.trim(),
      variables: allVars,
    });
  };

  return (
    <form id={formId} className={styles.form} onSubmit={handleSubmit} noValidate>

      {/* Name */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${formId}-name`}>
          Name <span className={styles.required}>*</span>
        </label>
        <input
          id={`${formId}-name`}
          className={`${styles.textarea} ${errors.name ? styles.error : ''}`}
          style={{ minHeight: 'unset', resize: 'none', padding: '10px 14px' }}
          placeholder="e.g. Appointment reminder"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
        />
        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
      </div>

      {/* Channel */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${formId}-channel`}>Channel</label>
        <div className={styles.selectWrapper}>
          <select
            id={`${formId}-channel`}
            className={styles.select}
            value={channel}
            onChange={(e) => setChannel(e.target.value as TemplateChannel)}
            disabled={disabled}
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
          <span className={styles.selectChevron}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${formId}-content`}>
          Content <span className={styles.required}>*</span>
        </label>
        <textarea
          id={`${formId}-content`}
          className={`${styles.textarea} ${errors.content ? styles.error : ''}`}
          placeholder={
            channel === 'email'
              ? 'Hi {{name}}, your order #{{code}} has shipped…'
              : 'Hi {{name}}, your appointment is on {{date}} at {{time}}.'
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={disabled}
          rows={4}
        />
        {errors.content
          ? <span className={styles.errorText}>{errors.content}</span>
          : <p className={styles.hint}>Use {'{{variableName}}'} syntax for dynamic values.</p>
        }
      </div>

      {/* Variables */}
      <div className={styles.varsSection}>
        <div className={styles.varsHeader}>
          <span className={styles.varsTitle}>
            Detected Variables
            {allVars.length > 0 && (
              <span className={styles.varCount}>{allVars.length}</span>
            )}
          </span>
        </div>

        <div className={styles.varTags}>
          {allVars.length === 0 ? (
            <span className={styles.noVars}>
              No variables yet — type {'{{variableName}}'} in the content.
            </span>
          ) : (
            allVars.map((v) => {
              const isManual = !detectedVars.includes(v);
              return (
                <span key={v} className={`${styles.varTag} ${isManual ? styles.manual : ''}`}>
                  {`{{${v}}}`}
                  {isManual && (
                    <button
                      type="button"
                      className={styles.removeTag}
                      onClick={() => handleRemoveManualVar(v)}
                      aria-label={`Remove ${v}`}
                    >
                      ✕
                    </button>
                  )}
                </span>
              );
            })
          )}
        </div>

        {/* Manual add */}
        <div className={styles.addVarRow}>
          <input
            className={styles.addVarInput}
            type="text"
            placeholder="add custom variable…"
            value={varInput}
            onChange={(e) => setVarInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVar(); } }}
            disabled={disabled}
          />
          <button type="button" className={styles.addVarBtn} onClick={handleAddVar} disabled={disabled}>
            + Add
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          <span className={styles.previewTitle}>
            <em className={styles.flashIcon}>⚡</em>
            Live Preview
          </span>
          <button
            type="button"
            className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
            onClick={handleCopy}
            disabled={!content.trim()}
          >
            {copied ? '✓ Copied' : '⧉ Copy'}
          </button>
        </div>

        <div className={`${styles.previewContent} ${!content.trim() ? styles.empty : ''}`}>
          {content.trim() ? previewText : 'Preview will appear as you type content…'}
        </div>
      </div>

    </form>
  );
};

