import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, FileSearch, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import ContractForm from '../../components/contracts/ContractForm';
import { dashboardApi } from '../../lib/api';
import type { Contract } from '../../types';
import { Button, Card, CardEyebrow, CardTitle, EmptyState, Input, RiskBadge, SkeletonRow } from '../../components/ui';

type SortKey = 'supplier_name' | 'item_name' | 'amount' | 'risk_level';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE = 10;

const riskWeight: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };

function getAmount(contract: Contract) {
  return Number(contract.awarded_unit_price ?? 0) * Number(contract.quantity ?? 0);
}

export default function ContractsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('amount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['contracts-page', page],
    queryFn: () => dashboardApi.contracts(page, PAGE_SIZE).then((res) => res.data),
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const filteredContracts = useMemo(() => {
    const contracts = data?.contracts ?? [];
    const filtered = query
      ? contracts.filter((contract) =>
          [contract.supplier_name, contract.item_name, contract.submitted_by]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
      : contracts;

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'supplier_name') comparison = a.supplier_name.localeCompare(b.supplier_name);
      else if (sortKey === 'item_name') comparison = (a.item_name ?? '').localeCompare(b.item_name ?? '');
      else if (sortKey === 'amount') comparison = getAmount(a) - getAmount(b);
      else if (sortKey === 'risk_level') comparison = (riskWeight[a.risk_level ?? 'Low'] ?? 0) - (riskWeight[b.risk_level ?? 'Low'] ?? 0);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, query, sortKey, sortDirection]);

  const totalPages = data?.total_pages ?? 1;

  const columns: { key: SortKey; label: string }[] = [
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'item_name', label: 'Item' },
    { key: 'amount', label: 'Amount' },
    { key: 'risk_level', label: 'Risk' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <CardEyebrow>Contracts</CardEyebrow>
            <CardTitle>Procurement ledger</CardTitle>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Review submitted contracts and their benchmark comparison across the auditor workflow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contracts…"
              aria-label="Search contracts"
              leftIcon={<Search className="h-4 w-4" />}
              className="w-full sm:w-64"
            />
            <Button type="button" onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="h-4 w-4" />} variant="secondary">
              Create contract
            </Button>
          </div>
        </div>
      </Card>

      <ContractForm isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      <Card padding="none" className="overflow-hidden">
        <div className="max-h-[32rem] overflow-auto">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
              <tr>
                {columns.map((column) => {
                  const isActive = sortKey === column.key;
                  return (
                    <th key={column.key} scope="col" className="px-5 py-3.5 text-left">
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:text-slate-800"
                      >
                        {column.label}
                        {isActive ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5 text-brand-600" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-brand-600" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-slate-300" />
                        )}
                      </button>
                    </th>
                  );
                })}
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Submitted by
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => <SkeletonRow key={index} columns={5} />)
              ) : filteredContracts.length ? (
                filteredContracts.map((contract) => (
                  <tr key={contract.contract_id} className="transition-colors hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">{contract.supplier_name}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{contract.item_name ?? '—'}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">
                      KES {getAmount(contract).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <RiskBadge level={contract.risk_level ?? 'Low'} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{contract.submitted_by ?? '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<FileSearch className="h-6 w-6" />}
                      title="No contracts match your search"
                      description="Try a different supplier, item, or reviewer name."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Page <span className="font-medium text-slate-700">{data?.page ?? page}</span> of{' '}
            <span className="font-medium text-slate-700">{totalPages}</span> &middot;{' '}
            <span className="font-medium text-slate-700">{data?.total ?? 0}</span> total contracts
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

