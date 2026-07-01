import type { ProductCategory, ProductDefinition } from './types'

export const STORAGE_KEY = 'coach-dairy-counter-v1'

export const DEFAULT_MILK_RATES = {
  cashRate: 100,
  creditRate: 100
}

export const MILK_QUANTITIES = ['0.5L', '1L', '1.5L', '2L', '2.5L', '3L'] as const

export const QUICK_PRODUCT_IDS = ['cigarettes-surya', 'cigarettes-pilot', 'cigarettes-shikhar', 'noodles', 'bread', 'tea', 'water', 'dahi', 'biscuits']

export const PRODUCT_CATEGORIES: ProductCategory[] = ['Milk', 'Cigarettes', 'Beverages', 'Snacks', 'Bakery', 'Food', 'Custom']

export const DEFAULT_PRODUCTS: ProductDefinition[] = [
  { id: 'cigarettes-surya', name: 'Surya', category: 'Cigarettes', price: 30, quick: true, removable: false, order: 1 },
  { id: 'cigarettes-pilot', name: 'Pilot', category: 'Cigarettes', price: 30, quick: true, removable: false, order: 2 },
  { id: 'cigarettes-shikhar', name: 'Shikhar', category: 'Cigarettes', price: 30, quick: true, removable: false, order: 3 },
  { id: 'noodles', name: 'Noodles', category: 'Food', price: 35, quick: true, removable: false, order: 4 },
  { id: 'bread', name: 'Bread', category: 'Bakery', price: 25, quick: true, removable: false, order: 5 },
  { id: 'tea', name: 'Tea', category: 'Beverages', price: 20, quick: true, removable: false, order: 6 },
  { id: 'water', name: 'Water', category: 'Beverages', price: 20, quick: true, removable: false, order: 7 },
  { id: 'dahi', name: 'Dahi', category: 'Food', price: 35, quick: true, removable: false, order: 8 },
  { id: 'biscuits', name: 'Biscuits', category: 'Snacks', price: 20, quick: true, removable: false, order: 9 },
  { id: 'chocolate', name: 'Chocolate', category: 'Snacks', price: 20, quick: false, removable: false, order: 20 },
  { id: 'soap', name: 'Soap', category: 'Custom', price: 25, quick: false, removable: false, order: 21 },
  { id: 'matchbox', name: 'Matchbox', category: 'Custom', price: 10, quick: false, removable: false, order: 22 },
  { id: 'puffed-rice', name: 'Puffed Rice', category: 'Snacks', price: 20, quick: false, removable: false, order: 23 },
  { id: 'cold-drinks', name: 'Cold Drinks', category: 'Beverages', price: 50, quick: false, removable: false, order: 24 }
]

export const CATEGORY_COLORS: Record<ProductCategory, string> = {
  Milk: 'from-emerald-500/20 to-emerald-500/5',
  Cigarettes: 'from-rose-500/20 to-rose-500/5',
  Beverages: 'from-sky-500/20 to-sky-500/5',
  Snacks: 'from-amber-500/20 to-amber-500/5',
  Bakery: 'from-fuchsia-500/20 to-fuchsia-500/5',
  Food: 'from-cyan-500/20 to-cyan-500/5',
  Custom: 'from-slate-500/20 to-slate-500/5'
}