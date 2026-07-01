import { DEFAULT_MILK_RATES, DEFAULT_PRODUCTS, STORAGE_KEY } from '../constants'
import type { PersistedState, Snapshot } from '../types'

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function defaultSnapshot(): Snapshot {
  return {
    milk: {
      cashLitres: 0,
      creditLitres: 0,
      cashRevenue: 0,
      creditRevenue: 0,
      breakdown: {},
      cashRate: DEFAULT_MILK_RATES.cashRate,
      creditRate: DEFAULT_MILK_RATES.creditRate
    },
    productCounts: {},
    catalog: DEFAULT_PRODUCTS
  }
}

export function loadState(): PersistedState {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  const today = todayKey()

  if (!raw) {
    return { ...defaultSnapshot(), dateKey: today, history: [] }
  }

  try {
    const parsed = JSON.parse(raw) as PersistedState
    const catalog = Array.isArray(parsed.catalog) && parsed.catalog.length > 0 ? parsed.catalog : DEFAULT_PRODUCTS

    if (parsed.dateKey !== today) {
      return {
        ...defaultSnapshot(),
        catalog,
        dateKey: today,
        history: []
      }
    }

    return {
      dateKey: parsed.dateKey,
      milk: parsed.milk ?? defaultSnapshot().milk,
      productCounts: parsed.productCounts ?? {},
      catalog,
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 25) : []
    }
  } catch {
    return { ...defaultSnapshot(), dateKey: today, history: [] }
  }
}

export function saveState(state: PersistedState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function buildProductId(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function cloneSnapshot(state: Pick<PersistedState, 'milk' | 'productCounts' | 'catalog'>): Snapshot {
  return {
    milk: {
      ...state.milk,
      breakdown: { ...state.milk.breakdown }
    },
    productCounts: Object.fromEntries(Object.entries(state.productCounts).map(([key, value]) => [key, { ...value }])),
    catalog: state.catalog.map((product) => ({ ...product }))
  }
}