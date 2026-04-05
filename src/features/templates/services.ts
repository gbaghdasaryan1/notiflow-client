import api from '@lib/axios';
import type { Template, CreateTemplatePayload, UpdateTemplatePayload } from './types';

export const templatesService = {
  getAll:  ()                                    => api.get<Template[]>('/templates'),
  create:  (payload: CreateTemplatePayload)      => api.post<Template>('/templates', payload),
  update:  (id: string, p: UpdateTemplatePayload) => api.patch<Template>(`/templates/${id}`, p),
  remove:  (id: string)                          => api.delete(`/templates/${id}`),
};
