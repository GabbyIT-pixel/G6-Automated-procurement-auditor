export type UserRole = 'admin' | 'auditor' | 'officer';

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_login_at?: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Benchmark {
  baseline_id: string;
  item_name: string;
  item_code: string;
  unit_of_measure: string;
  category: string;
  reference_price_kes: number;
  price_source?: string;
  price_verified_date?: string;
  tolerance_pct: number;
}

export interface Contract {
  contract_id: string;
  supplier_name: string;
  contract_date: string;
  quantity: number;
  awarded_unit_price: number;
  created_at: string;
  item_name?: string;
  item_code?: string;
  unit_of_measure?: string;
  reference_price_kes?: number;
  submitted_by?: string;
  alert_id?: string;
  risk_level?: RiskLevel;
  variance_pct?: number;
  flagged_at?: string;
}

export interface AlertItem {
  alert_id: string;
  risk_level: RiskLevel;
  variance_pct: number;
  flagged_at: string;
  contract_id: string;
  supplier_name: string;
  contract_date: string;
  quantity: number;
  awarded_unit_price: number;
  item_name: string;
  item_code: string;
  reference_price_kes: number;
  estimated_overpayment_kes: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ContractsResponse {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  contracts: Contract[];
}

export interface AlertsResponse {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  alerts: AlertItem[];
}

export interface BenchmarksResponse {
  count: number;
  benchmarks: Benchmark[];
}
