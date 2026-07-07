import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { dashboardApi } from '../../lib/api';

export default function ContractsPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['contracts-page'],
    queryFn: () => dashboardApi.contracts(1, 12).then((res) => res.data),
  });

  const filteredContracts = useMemo(() => {
    const contracts = data?.contracts ?? [];
    if (!query) return contracts;
    return contracts.filter((contract) =>
      [contract.supplier_name, contract.item_name, contract.submitted_by]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [data, query]);

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Contracts</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Procurement ledger</h2>
            <p className="mt-2 text-sm text-slate-500">Review submitted contracts and their benchmark comparison across the auditor workflow.</p>
          </div>

          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            <Search className="h-4 w-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contracts"
              className="w-48 bg-transparent outline-none"
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">Supplier</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">Item</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">Amount</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">Risk</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">Submitted by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                [1, 2, 3, 4].map((item) => (
                  <tr key={item}>
                    <td className="px-5 py-4"><div className="h-4 w-24 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-16 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-16 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 animate-pulse rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : filteredContracts.length ? (
                filteredContracts.map((contract) => (
                  <tr key={contract.contract_id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm font-medium text-slate-900">{contract.supplier_name}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{contract.item_name ?? '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">KES {contract.awarded_unit_price.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{contract.risk_level ?? 'Low'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{contract.submitted_by ?? '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">No contracts match the current search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
