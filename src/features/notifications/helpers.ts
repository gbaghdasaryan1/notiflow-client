import type { Customer } from '@features/customers';
import type { VariableConfig } from './components/BulkVariablesForm';

export const resolveData = (
  configs: Record<string, VariableConfig>,
  customer: Customer
): Record<string, string> => {
  const data: Record<string, string> = {};
  for (const [key, config] of Object.entries(configs)) {
    if (config.mode === 'static') {
      if (config.value.trim()) data[key] = config.value;
    } else {
      const value = customer[config.field as keyof Customer] as
        | string
        | undefined;
      if (value) data[key] = value;
    }
  }
  return data;
};
