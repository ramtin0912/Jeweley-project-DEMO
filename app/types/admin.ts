/**
 * @file admin
 * @description Admin panel DTO types.
 *
 * @status None
 * @issues None
 * @todo None
 */

export interface OrderItem {
  id: number
  nameFa: string
  priceToman: number
  quantity: number
  variantLabel: string | null
}

export interface Order {
  id: number
  orderNumber: string
  customerName: string
  customerPhone: string
  province: string
  city: string
  address: string
  postalCode: string | null
  status: string
  totalToman: number
  paidAt: string | null
  createdAt: string
  items: OrderItem[]
}

export interface Earnings {
  totalRevenue: number
  orderCount: number
  thisMonthRevenue: number
  thisMonthOrderCount: number
  lastMonthRevenue: number
  todayRevenue: number
  perProduct: Array<{ nameFa: string; quantity: number; revenue: number }>
  recentOrders: Array<{
    orderNumber: string
    customerName: string
    totalToman: number
    status: string
    createdAt: string
    paidAt: string | null
    itemCount: number
  }>
}

export interface FinanceStatusRow {
  status: string
  label: string
  count: number
  revenue: number
}

export interface Finance {
  totals: {
    totalRevenue: number
    orderCount: number
    thisMonthRevenue: number
    thisMonthOrderCount: number
    lastMonthRevenue: number
    todayRevenue: number
    avgOrderValue: number
  }
  monthly: Array<{ year: number; month: number; label: string; revenue: number; orderCount: number }>
  monthTotal: number
  monthPage: number
  monthPerPage: number
  perProduct: Array<{ nameFa: string; quantity: number; revenue: number }>
}

export interface OrdersResponse {
  orders: Order[]
  statusBreakdown: FinanceStatusRow[]
}
