import api from '@lib/axios';
import type { CreateCustomerPayload, Customer } from '@features/customers/types';

export const customersService = {
  getAll: () => api.get<Customer[]>('/customers'),
  create: (payload: CreateCustomerPayload) => api.post<Customer>('/customers', payload),
  remove: (id: string) => api.delete(`/customers/${id}`),
};
