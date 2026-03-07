export interface User {
  id: number;
  username: string;
  businessName: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
}

export interface Invoice {
  id: number;
  client_name: string;
  client_email: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  created_at: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface PayrollEntry {
  id: number;
  employee_name: string;
  role: string;
  salary: number;
  tax_deduction: number;
  net_pay: number;
  payment_date: string;
}

export interface ProfitLossReport {
  income: number;
  expenses: number;
  profit: number;
}
