import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { templatesService } from './services';
import type { CreateTemplatePayload, Template, UpdateTemplatePayload } from './types';

export const TEMPLATES_KEY = ['templates'] as const;

export const useTemplatesQuery = () =>
  useQuery({
    queryKey: TEMPLATES_KEY,
    queryFn: () => templatesService.getAll().then((r) => r.data),
  });

export const useCreateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) =>
      templatesService.create(payload).then((r) => r.data),
    onSuccess: (template: Template) => {
      qc.setQueryData<Template[]>(TEMPLATES_KEY, (old = []) => [template, ...old]);
    },
  });
};

export const useUpdateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTemplatePayload }) =>
      templatesService.update(id, payload).then((r) => r.data),
    onSuccess: (template: Template) => {
      qc.setQueryData<Template[]>(TEMPLATES_KEY, (old = []) =>
        old.map((t) => (t.id === template.id ? template : t)),
      );
    },
  });
};

export const useDeleteTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templatesService.remove(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<Template[]>(TEMPLATES_KEY, (old = []) =>
        old.filter((t) => t.id !== id),
      );
    },
  });
};
