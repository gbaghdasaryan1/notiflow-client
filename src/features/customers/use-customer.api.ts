import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CUSTOMERS_KEY, type CreateCustomerPayload, type Customer } from '@features/customers/types';
import { customersService } from './services';



export const useCustomersQuery = () =>
  useQuery({
    queryKey: CUSTOMERS_KEY,
    queryFn: () => customersService.getAll().then((r) => r.data),
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) =>
      customersService.create(payload).then((r) => r.data),
    onSuccess: (customer: Customer) => {
      qc.setQueryData<Customer[]>(CUSTOMERS_KEY, (old = []) => [customer, ...old]);
    },
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersService.remove(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<Customer[]>(CUSTOMERS_KEY, (old = []) =>
        old.filter((c) => c.id !== id),
      );
    },
  });
};
