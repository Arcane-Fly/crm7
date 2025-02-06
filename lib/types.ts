export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  status: string;
}

export interface FinancialStats {
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ComplianceRecord {
  id: string;
  status: 'compliant' | 'warning' | 'violation';
  category: string;
  description: string;
  date: string;
  resolution?: string;
}
