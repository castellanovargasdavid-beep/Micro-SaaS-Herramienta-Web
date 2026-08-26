import type { ProposalScopeItem } from "@/types/database";

/** Subtotal de una línea: cantidad × precio unitario (cantidad = 1 salvo "hourly"). */
export function computeItemSubtotal(
  item: Pick<ProposalScopeItem, "quantity" | "unitPrice">,
): number {
  const quantity = item.quantity ?? 1;
  const unitPrice = item.unitPrice ?? 0;
  return Math.round(quantity * unitPrice * 100) / 100;
}

export interface ProposalTotals {
  subtotal: number;
  afterDiscount: number;
  taxAmount: number;
  total: number;
}

/** Subtotal (suma de líneas) → resta descuento → aplica IVA → total. */
export function computeProposalTotals(
  items: ProposalScopeItem[],
  discountAmount: number,
  taxPercentage: number,
): ProposalTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.unitPrice != null ? computeItemSubtotal(item) : 0),
    0,
  );
  const afterDiscount = Math.max(subtotal - discountAmount, 0);
  const taxAmount = Math.round(afterDiscount * (taxPercentage / 100) * 100) / 100;
  const total = Math.round((afterDiscount + taxAmount) * 100) / 100;
  return { subtotal, afterDiscount, taxAmount, total };
}
