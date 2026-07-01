import { MILK_QUANTITIES } from '../constants'
import type { MilkState, ProductCount, ProductDefinition } from '../types'

function formatMoney(amount: number) {
  return amount.toFixed(0)
}

function formatLitres(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function calculateMilkTotal(milk: MilkState) {
  return milk.cashLitres + milk.creditLitres
}

export function calculateRevenue(milk: MilkState, productCounts: Record<string, ProductCount>) {
  const milkRevenue = milk.cashRevenue + milk.creditRevenue
  const productRevenue = Object.values(productCounts).reduce((sum, item) => sum + item.revenue, 0)
  return milkRevenue + productRevenue
}

export function buildSummaryText(params: {
  dateLabel: string
  milk: MilkState
  productCounts: Record<string, ProductCount>
  catalog: ProductDefinition[]
}) {
  const { dateLabel, milk, productCounts, catalog } = params
  const lines = [
    `Date: ${dateLabel}`,
    `Milk Cash: ${formatLitres(milk.cashLitres)}L`,
    `Milk Credit: ${formatLitres(milk.creditLitres)}L`,
    `Total Milk: ${formatLitres(calculateMilkTotal(milk))}L`,
    `Milk Revenue: ${formatMoney(milk.cashRevenue + milk.creditRevenue)}`
  ]

  const counts = new Map<string, ProductCount>()
  for (const [id, count] of Object.entries(productCounts)) {
    if (count.quantity > 0) {
      counts.set(id, count)
    }
  }

  for (const product of [...catalog].sort((left, right) => left.order - right.order)) {
    const count = counts.get(product.id)
    if (count) {
      lines.push(`${product.name}: ${count.quantity} (${formatMoney(count.revenue)})`)
    }
  }

  lines.push(`Total Revenue: ${formatMoney(calculateRevenue(milk, productCounts))}`)
  return lines.join('\n')
}

export function formatMilkBreakdown(breakdown: Record<string, number>) {
  return MILK_QUANTITIES.map((quantity) => ({ quantity, count: breakdown[quantity] ?? 0 })).filter((item) => item.count > 0)
}