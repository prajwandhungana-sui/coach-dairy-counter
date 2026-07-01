export type Screen = 'home' | 'categories' | 'summary'
export type PaymentType = 'cash' | 'credit'

export type ProductCategory = 'Milk' | 'Cigarettes' | 'Beverages' | 'Snacks' | 'Bakery' | 'Food' | 'Custom'

export interface ProductDefinition {
  id: string
  name: string
  category: ProductCategory
  price: number
  quick?: boolean
  removable?: boolean
  order: number
}

export interface ProductCount {
  quantity: number
  revenue: number
}

export interface MilkState {
  cashLitres: number
  creditLitres: number
  cashRevenue: number
  creditRevenue: number
  breakdown: Record<string, number>
  cashRate: number
  creditRate: number
}

export interface Snapshot {
  milk: MilkState
  productCounts: Record<string, ProductCount>
  catalog: ProductDefinition[]
}

export interface PersistedState extends Snapshot {
  dateKey: string
  history: Snapshot[]
}

export interface ProductFormValues {
  id?: string
  name: string
  category: ProductCategory
  price: string
  quick: boolean
}