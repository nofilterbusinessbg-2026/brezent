import type { Invoice, InvoiceStatus, InvoiceType } from "@/types";

export function computeInvoiceTotals(input: {
  amountNoVat: number;
  hasVat: boolean;
  vatRate?: number;
}): { vatAmount: number; amountWithVat: number } {
  const rate = input.vatRate ?? 0.2;
  const amountNoVat = Number.isFinite(input.amountNoVat) ? input.amountNoVat : 0;
  const vatAmount = input.hasVat ? round2(amountNoVat * rate) : 0;
  const amountWithVat = round2(amountNoVat + vatAmount);
  return { vatAmount, amountWithVat };
}

export function normalizeInvoiceStatusForType(
  type: InvoiceType,
  status: InvoiceStatus
): InvoiceStatus {
  if (type === "expense" && status === "no_invoice") return "unpaid";
  return status;
}

export function canMarkPaid(i: Pick<Invoice, "type" | "status">) {
  return i.type === "income" && (i.status === "unpaid" || i.status === "overdue");
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

