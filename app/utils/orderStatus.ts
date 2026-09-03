/**
 * @file orderStatus
 * @description Single source of truth for order-status labels and badge styling in the
 *   admin panel. Dashboard recent orders and the orders page both consume this so the
 *   label and color can never drift apart.
 *
 * @status None
 * @issues None
 * @todo None
 */
// story: e03s02

import type { FinanceStatusRow } from '~/types/admin'

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'در انتظار پرداخت',
  PAID: 'پرداخت شده',
  SHIPPED: 'ارسال شده',
  DELIVERED: 'تحویل شده',
  CANCELED: 'لغو شده'
}

export const ORDER_STATUS_ORDER: string[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED']

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status
}

/**
 * Aggregates a set of orders into an order-status split (count + revenue per status),
 * always in the canonical ORDER_STATUS_ORDER. Shared by the finance hub and the
 * orders page so the two can never drift apart.
 */
export function computeStatusBreakdown(
  orders: Array<{ status: string; totalToman: number }>
): FinanceStatusRow[] {
  const byStatus = new Map<string, { count: number; revenue: number }>()
  for (const order of orders) {
    const row = byStatus.get(order.status) ?? { count: 0, revenue: 0 }
    row.count += 1
    row.revenue += order.totalToman
    byStatus.set(order.status, row)
  }

  return ORDER_STATUS_ORDER.map((status) => {
    const row = byStatus.get(status) ?? { count: 0, revenue: 0 }
    return { status, label: orderStatusLabel(status), count: row.count, revenue: row.revenue }
  })
}

export function orderStatusBadgeClass(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800'
    case 'PAID':
      return 'bg-emerald-100 text-emerald-800'
    case 'SHIPPED':
      return 'bg-sky-100 text-sky-800'
    case 'DELIVERED':
      return 'bg-green-600 text-white'
    case 'CANCELED':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-neutral-100 text-neutral-700'
  }
}
