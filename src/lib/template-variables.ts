export const VAR_RE = /\{\{(\w+)\}\}/g;

/** Extract unique variable names from a template content string. */
export const extractVariables = (content: string): string[] => {
  const seen = new Set<string>();
  for (const m of content.matchAll(VAR_RE)) seen.add(m[1]);
  return Array.from(seen);
};

/**
 * Sample values used for the live preview.
 * Unknown variables fall back to [varName].
 */
const SAMPLE: Record<string, string> = {
  name:        'John',
  firstName:   'John',
  lastName:    'Smith',
  date:        'tomorrow',
  time:        '3:00 PM',
  email:       'john@example.com',
  phone:       '+1 555 123 4567',
  company:     'Acme Corp',
  amount:      '$99.00',
  link:        'https://app.notiflow.io/verify',
  code:        'ABC-1234',
  expiry:      'Dec 31, 2025',
  product:     'Pro Plan',
  subject:     'Your account',
};

/** Render a template string with sample data for preview purposes. */
export const renderPreview = (content: string): string =>
  content.replace(VAR_RE, (_, key: string) => SAMPLE[key] ?? `[${key}]`);

/** Render a template string with actual user-supplied values. */
export const renderWithValues = (
  content: string,
  values: Record<string, string>,
): string =>
  content.replace(VAR_RE, (_, key: string) => values[key]?.trim() || `{{${key}}}`);

/** A segment of parsed template content for rich live-preview rendering. */
export type ContentPart =
  | { kind: 'text';     value: string }
  | { kind: 'filled';   varName: string; value: string }
  | { kind: 'unfilled'; varName: string };

/**
 * Split a template content string into typed segments so the UI can
 * render filled variables in green and unfilled ones in amber.
 */
export const parseContentParts = (
  content: string,
  values: Record<string, string>,
): ContentPart[] => {
  const parts: ContentPart[] = [];
  let last = 0;
  const re = /\{\{(\w+)\}\}/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(content)) !== null) {
    if (m.index > last) parts.push({ kind: 'text', value: content.slice(last, m.index) });
    const key = m[1];
    const val = values[key]?.trim();
    parts.push(val ? { kind: 'filled', varName: key, value: val } : { kind: 'unfilled', varName: key });
    last = re.lastIndex;
  }

  if (last < content.length) parts.push({ kind: 'text', value: content.slice(last) });
  return parts;
};
