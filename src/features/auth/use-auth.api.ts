import { useMutation } from '@tanstack/react-query';
import { authService } from './services';
import { useAuthStore } from './store';
import type { RegisterPayload } from './types';

export const useLogin = () => {
  const setToken = useAuthStore((s) => s.setToken);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password).then((r) => r.data),
    onSuccess: (data) => {
      setToken(data.access_token);
    },
  });
};

export const useRegister = () => {
  const setToken = useAuthStore((s) => s.setToken);
  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      authService.register(payload).then((r) => r.data),
    onSuccess: (data) => {
      setToken(data.access_token);
    },
  });
};
