import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import api from '../../lib/api';
import type { Benchmark } from '../../types';

const formSchema = z.object({
  baseline_id: z.string().min(1, 'Choose a benchmark before submitting'),
  supplier_name: z.string().min(2, 'Supplier name is required'),
  contract_date: z.string().min(1, 'Select the contract date'),
  quantity: z.coerce.number().int().positive('Quantity must be a positive integer'),
  awarded_unit_price: z.coerce.number().positive('Awarded unit price must be greater than zero'),
});

type FormValues = z.infer<typeof formSchema>;

interface ContractFormProps {
  onClose: () => void;
}

export default function ContractForm({ onClose }: ContractFormProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['contract-form-benchmarks'],
    queryFn: () => api.get('/benchmarks').then((res) => res.data),
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-3 sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-soft"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">New contract</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Submit a procurement record</h3>
            <p className="mt-2 text-sm text-slate-500">The form is aligned to the backend schema and will trigger the audit engine automatically.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {mutation.isError ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Unable to create the contract. Please review the data and try again.
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Benchmark reference
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
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
              {errors.baseline_id ? <p className="mt-2 text-sm text-red-600">{errors.baseline_id.message}</p> : null}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Supplier name
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                placeholder="e.g. Nairobi Medical Supplies"
                {...register('supplier_name')}
              />
              {errors.supplier_name ? <p className="mt-2 text-sm text-red-600">{errors.supplier_name.message}</p> : null}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Contract date
              <input
                type="date"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                {...register('contract_date')}
              />
              {errors.contract_date ? <p className="mt-2 text-sm text-red-600">{errors.contract_date.message}</p> : null}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Quantity
              <input
                type="number"
                min="1"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                {...register('quantity', { valueAsNumber: true })}
              />
              {errors.quantity ? <p className="mt-2 text-sm text-red-600">{errors.quantity.message}</p> : null}
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Awarded unit price (KES)
            <input
              type="number"
              step="0.01"
              min="0"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              {...register('awarded_unit_price', { valueAsNumber: true })}
            />
            {errors.awarded_unit_price ? <p className="mt-2 text-sm text-red-600">{errors.awarded_unit_price.message}</p> : null}
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mutation.isPending ? 'Creating…' : 'Create contract'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
