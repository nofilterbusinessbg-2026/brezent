import type {
  BusinessTrip,
  CashMovement,
  ChartDataPoint,
  DashboardMetrics,
  FixedCost,
  Invoice,
} from "@/types";
import { endOfMonth, format, isAfter, startOfMonth, subMonths } from "date-fns";

export function calculateDashboardMetrics(
  invoices: Invoice[],
  movements: CashMovement[],
  fixedCosts: FixedCost[],
  trips: BusinessTrip[],
  month: number,
  year: number
): DashboardMetrics {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const inMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= monthStart && d <= monthEnd;
  };

  const cashBalance = movements
    .filter((m) => m.payment_method === "cash")
    .reduce((sum, m) => sum + (m.type === "income" ? m.amount : -m.amount), 0);

  const bankBalance = movements
    .filter((m) => m.payment_method === "bank")
    .reduce((sum, m) => sum + (m.type === "income" ? m.amount : -m.amount), 0);

  const monthlyIncome = invoices
    .filter(
      (i) =>
        i.type === "income" &&
        ["paid_cash", "paid_bank", "no_invoice"].includes(i.status) &&
        inMonth(i.invoice_date)
    )
    .reduce((sum, i) => sum + i.amount_with_vat, 0);

  const paidExpenses = invoices
    .filter(
      (i) =>
        i.type === "expense" &&
        ["paid_cash", "paid_bank"].includes(i.status) &&
        inMonth(i.invoice_date)
    )
    .reduce((sum, i) => sum + i.amount_with_vat, 0);

  const fixedCostsTotal = fixedCosts
    .filter((fc) => fc.is_active)
    .reduce((sum, fc) => sum + fc.amount, 0);

  const tripsTotal = trips
    .filter((t) => inMonth(t.trip_date))
    .reduce((sum, t) => sum + t.total_cost, 0);

  const monthlyExpenses = paidExpenses + fixedCostsTotal + tripsTotal;
  const profit = monthlyIncome - monthlyExpenses;

  const vatCollected = invoices
    .filter((i) => i.type === "income" && i.has_vat && inMonth(i.invoice_date))
    .reduce((sum, i) => sum + i.vat_amount, 0);

  const vatPaid = invoices
    .filter((i) => i.type === "expense" && i.has_vat && inMonth(i.invoice_date))
    .reduce((sum, i) => sum + i.vat_amount, 0);

  const pendingIncome = invoices
    .filter((i) => i.type === "income" && i.status === "unpaid")
    .reduce((sum, i) => sum + i.amount_with_vat, 0);

  const today = new Date();
  const unpaidInvoices = invoices
    .filter(
      (i) =>
        i.type === "income" && (i.status === "unpaid" || i.status === "overdue")
    )
    .map((i) => ({
      ...i,
      status: (i.due_date && isAfter(today, new Date(i.due_date))
        ? "overdue"
        : i.status) as Invoice["status"],
    }));

  const chartData: ChartDataPoint[] = Array.from({ length: 6 }, (_, idx) => {
    const d = subMonths(new Date(year, month - 1), 5 - idx);
    const label = format(d, "MMM yyyy");

    const mStart = startOfMonth(d);
    const mEnd = endOfMonth(d);
    const inM = (s: string) => {
      const dt = new Date(s);
      return dt >= mStart && dt <= mEnd;
    };

    const inc = invoices
      .filter(
        (i) =>
          i.type === "income" &&
          ["paid_cash", "paid_bank", "no_invoice"].includes(i.status) &&
          inM(i.invoice_date)
      )
      .reduce((s, i) => s + i.amount_with_vat, 0);

    const exp =
      invoices
        .filter(
          (i) =>
            i.type === "expense" &&
            ["paid_cash", "paid_bank"].includes(i.status) &&
            inM(i.invoice_date)
        )
        .reduce((s, i) => s + i.amount_with_vat, 0) +
      fixedCostsTotal +
      trips
        .filter((t) => inM(t.trip_date))
        .reduce((s, t) => s + t.total_cost, 0);

    return { month: label, income: inc, expenses: exp, profit: inc - exp };
  });

  return {
    cashBalance,
    bankBalance,
    totalBalance: cashBalance + bankBalance,
    monthlyIncome,
    monthlyExpenses,
    profit,
    pendingIncome,
    vatCollected,
    vatPaid,
    vatDue: vatCollected - vatPaid,
    unpaidInvoices,
    chartData,
  };
}

export function formatCurrency(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

