export type UserRole = "owner" | "secretary";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export type InvoiceStatus =
  | "paid_cash"
  | "paid_bank"
  | "unpaid"
  | "overdue"
  | "no_invoice";
export type PaymentMethod = "cash" | "bank";
export type InvoiceType = "income" | "expense";

export interface Invoice {
  id: string;
  invoice_number?: string;
  type: InvoiceType;
  client_name: string;
  description?: string;
  amount_no_vat: number;
  vat_amount: number;
  amount_with_vat: number;
  has_vat: boolean;
  invoice_date: string;
  due_date?: string;
  status: InvoiceStatus;
  payment_date?: string;
  payment_method?: PaymentMethod;
  notes?: string;
  is_deleted: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type MovementCategory =
  | "invoice_payment"
  | "advance"
  | "expense_material"
  | "expense_travel"
  | "expense_salary"
  | "expense_other"
  | "income_no_invoice"
  | "other";

export interface CashMovement {
  id: string;
  type: "income" | "expense";
  amount: number;
  payment_method: PaymentMethod;
  description: string;
  client_or_supplier?: string;
  invoice_id?: string;
  movement_date: string;
  category?: MovementCategory;
  created_by?: string;
  created_at: string;
}

export interface FixedCost {
  id: string;
  name: string;
  amount: number;
  category: "rent" | "salaries" | "utilities" | "other";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessTrip {
  id: string;
  destination: string;
  trip_date: string;
  days: number;
  people: number;
  fuel_cost: number;
  accommodation_cost: number;
  other_cost: number;
  total_cost: number;
  notes?: string;
  order_reference?: string;
  created_by?: string;
  created_at: string;
}

export interface DashboardMetrics {
  cashBalance: number;
  bankBalance: number;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  profit: number;
  pendingIncome: number;
  vatCollected: number;
  vatPaid: number;
  vatDue: number;
  unpaidInvoices: Invoice[];
  chartData: ChartDataPoint[];
}

export interface ChartDataPoint {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

