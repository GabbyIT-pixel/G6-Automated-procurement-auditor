import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import api from '../../lib/api';
import type { Benchmark } from '../../types';
import { Button, FieldError, Input, Label, Modal } from '../ui';

const formSchema = z.object({
  baseline_id: z.string().min(1, 'Choose a benchmark before submitting'),
  supplier_name: z.string().min(2, 'Supplier name is required'),
  contract_date: z.string().min(1, 'Select the contract date'),
  quantity: z.coerce.number().int().positive('Quantity must be a positive integer'),
  awarded_unit_price: z.coerce.number().positive('Awarded unit price must be greater than zero'),
});

type FormValues = z.infer<typeof formSchema>;

interface ContractFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContractForm({ isOpen, onClose }: ContractFormProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['contract-form-benchmarks'],
    queryFn: () => api.get('/benchmarks').then((res) => res.data),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseline_id: '',
      supplier_name: '',
      contract_date: '',
      quantity: 1,
      awarded_unit_price: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.post('/contracts', {
        ...values,
        quantity: Number(values.quantity),
        awarded_unit_price: Number(values.awarded_unit_price),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts-page'] });
      queryClient.invalidateQueries({ queryKey: ['alerts-page'] });
      queryClient.invalidateQueries({ queryKey: ['contracts-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['alerts-dashboard'] });
      reset();
      onClose();
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="New contract"
      title="Submit a procurement record"
      description="The form is aligned to the backend schema and will trigger the audit engine automatically."
    >
      {mutation.isError ? (
        <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Unable to create the contract. Please review the data and try again.
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="baseline_id">Benchmark reference</Label>
            <select
              id="baseline_id"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:shadow-focus-ring"
              {...register('baseline_id')}
            >
              <option value="">Select a benchmark</option>
              {isLoading ? (
                <option value="" disabled>Loading benchmarks…</option>
              ) : (
                (data?.benchmarks ?? []).map((benchmark: Benchmark) => (
                  <option key={benchmark.baseline_id} value={benchmark.baseline_id}>
                    {benchmark.item_name} · {benchmark.item_code}
                  </option>
                ))
              )}
            </select>
            <FieldError>{errors.baseline_id?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="supplier_name">Supplier name</Label>
            <Input
              id="supplier_name"
              placeholder="e.g. Nairobi Medical Supplies"
              invalid={Boolean(errors.supplier_name)}
              {...register('supplier_name')}
            />
            <FieldError>{errors.supplier_name?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="contract_date">Contract date</Label>
            <Input id="contract_date" type="date" invalid={Boolean(errors.contract_date)} {...register('contract_date')} />
            <FieldError>{errors.contract_date?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              invalid={Boolean(errors.quantity)}
              {...register('quantity', { valueAsNumber: true })}
            />
            <FieldError>{errors.quantity?.message}</FieldError>
          </div>
        </div>

        <div>
          <Label htmlFor="awarded_unit_price">Awarded unit price (KES)</Label>
          <Input
            id="awarded_unit_price"
            type="number"
            step="0.01"
            min="0"
            invalid={Boolean(errors.awarded_unit_price)}
            {...register('awarded_unit_price', { valueAsNumber: true })}
          />
          <FieldError>{errors.awarded_unit_price?.message}</FieldError>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" isLoading={mutation.isPending}>
            {mutation.isPending ? 'Creating…' : 'Create contract'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

