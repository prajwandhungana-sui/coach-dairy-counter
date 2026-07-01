import { useEffect, useMemo, useState } from 'react'
import { ArchiveRestore, Check, LayoutGrid, MoonStar, Plus, Save, Store } from 'lucide-react'
import { CATEGORY_COLORS, PRODUCT_CATEGORIES, QUICK_PRODUCT_IDS } from './constants'
import { FloatingActions } from './components/FloatingActions'
import { MilkCard } from './components/MilkCard'
import { Modal } from './components/Modal'
import { ProductTile } from './components/ProductTile'
import { StatCard } from './components/StatCard'
import { buildProductId, cloneSnapshot, defaultSnapshot, loadState, saveState, todayKey } from './lib/storage'
import { buildSummaryText, calculateMilkTotal, calculateRevenue, formatMilkBreakdown } from './lib/summary'
import type { PaymentType, PersistedState, ProductDefinition, ProductCount, ProductFormValues, Screen } from './types'

const money = new Intl.NumberFormat('en-NP', { maximumFractionDigits: 0 })

function formatDateLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function emptyProductForm(): ProductFormValues {
  return {
    name: '',
    category: 'Custom',
    price: '0',
    quick: false
  }
}

function ensureProductCount(productCounts: Record<string, ProductCount>, id: string): ProductCount {
  return productCounts[id] ?? { quantity: 0, revenue: 0 }
}

export default function App() {
  const [state, setState] = useState<PersistedState>(() => loadState())
  const [screen, setScreen] = useState<Screen>('home')
  const [message, setMessage] = useState('')
  const [customMilkOpen, setCustomMilkOpen] = useState(false)
  const [customMilkPayment, setCustomMilkPayment] = useState<PaymentType>('cash')
  const [customMilkValue, setCustomMilkValue] = useState('')
  const [productEditorOpen, setProductEditorOpen] = useState(false)
  const [productForm, setProductForm] = useState<ProductFormValues>(emptyProductForm())
  const [resetOpen, setResetOpen] = useState(false)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    document.title = `Coach Dairy Counter · ${formatDateLabel(state.dateKey)}`
  }, [state.dateKey])

  useEffect(() => {
    const today = todayKey()
    if (state.dateKey !== today) {
      setState((current) => ({
        ...current,
        dateKey: today,
        history: [],
        milk: { ...defaultSnapshot().milk, cashRate: current.milk.cashRate, creditRate: current.milk.creditRate },
        productCounts: {}
      }))
    }
  }, [state.dateKey])

  const catalog = useMemo(
    () => [...state.catalog].sort((left, right) => left.order - right.order || left.name.localeCompare(right.name)),
    [state.catalog]
  )

  const productMap = useMemo(() => new Map(catalog.map((product) => [product.id, product])), [catalog])

  const quickProducts = useMemo(() => catalog.filter((product) => QUICK_PRODUCT_IDS.includes(product.id)), [catalog])

  const totalRevenue = useMemo(() => calculateRevenue(state.milk, state.productCounts), [state.milk, state.productCounts])
  const totalMilkLitres = useMemo(() => calculateMilkTotal(state.milk), [state.milk])

  function pushHistory(previous: PersistedState) {
    const snapshot = cloneSnapshot(previous)
    return {
      ...previous,
      history: [snapshot, ...previous.history].slice(0, 25)
    }
  }

  function commit(update: (current: PersistedState) => PersistedState) {
    setState((current) => {
      const withHistory = pushHistory(current)
      return update(withHistory)
    })
  }

  function setMilkRates(cashRate: number, creditRate: number) {
    setState((current) => ({
      ...current,
      milk: {
        ...current.milk,
        cashRate,
        creditRate
      }
    }))
  }

  function addMilkSale(payment: PaymentType, quantityLabel: string, liters: number) {
    commit((current) => {
      const rate = payment === 'cash' ? current.milk.cashRate : current.milk.creditRate
      const revenue = rate * liters

      return {
        ...current,
        milk: {
          ...current.milk,
          cashLitres: current.milk.cashLitres + (payment === 'cash' ? liters : 0),
          creditLitres: current.milk.creditLitres + (payment === 'credit' ? liters : 0),
          cashRevenue: current.milk.cashRevenue + (payment === 'cash' ? revenue : 0),
          creditRevenue: current.milk.creditRevenue + (payment === 'credit' ? revenue : 0),
          breakdown: {
            ...current.milk.breakdown,
            [quantityLabel]: (current.milk.breakdown[quantityLabel] ?? 0) + 1
          }
        }
      }
    })
    setMessage(`Added ${quantityLabel} ${payment} milk`)
  }

  function addMilk(payment: PaymentType, quantityLabel: string) {
    const liters = Number(quantityLabel.replace('L', ''))
    addMilkSale(payment, quantityLabel, liters)
  }

  function addCustomMilk() {
    const liters = Number(customMilkValue)
    if (!Number.isFinite(liters) || liters <= 0) {
      setMessage('Enter a valid litre amount')
      return
    }
    const quantityLabel = `${liters}L`
    addMilkSale(customMilkPayment, quantityLabel, liters)
    setCustomMilkOpen(false)
    setCustomMilkValue('')
  }

  function adjustProduct(productId: string, delta: number) {
    commit((current) => {
      const product = productMap.get(productId)
      if (!product) {
        return current
      }
      const existing = ensureProductCount(current.productCounts, productId)
      const quantity = Math.max(0, existing.quantity + delta)
      return {
        ...current,
        productCounts: {
          ...current.productCounts,
          [productId]: {
            quantity,
            revenue: quantity * product.price
          }
        }
      }
    })
  }

  function undoLastAction() {
    setState((current) => {
      const [latest, ...rest] = current.history
      if (!latest) {
        return current
      }
      return {
        ...current,
        ...latest,
        history: rest
      }
    })
  }

  function resetDay() {
    setState((current) => ({
      ...current,
      dateKey: todayKey(),
      history: [],
      milk: {
        ...defaultSnapshot().milk,
        cashRate: current.milk.cashRate,
        creditRate: current.milk.creditRate
      },
      productCounts: {}
    }))
    setResetOpen(false)
    setMessage('Day reset. Products kept.')
  }

  function openProductEditor(product?: ProductDefinition) {
    setProductForm(
      product
        ? {
            id: product.id,
            name: product.name,
            category: product.category,
            price: String(product.price),
            quick: Boolean(product.quick)
          }
        : emptyProductForm()
    )
    setProductEditorOpen(true)
  }

  function saveProduct() {
    const name = productForm.name.trim()
    const price = Number(productForm.price)
    if (!name || !Number.isFinite(price) || price < 0) {
      setMessage('Enter a product name and price')
      return
    }

    commit((current) => {
      const id = productForm.id ?? buildProductId(name)
      const existing = current.catalog.find((item) => item.id === id)
      const nextCatalog = [...current.catalog]
      const nextProduct: ProductDefinition = {
        id,
        name,
        category: productForm.category,
        price,
        quick: productForm.quick,
        removable: existing?.removable ?? true,
        order: existing?.order ?? nextCatalog.length + 100
      }

      const index = nextCatalog.findIndex((item) => item.id === id)
      if (index >= 0) {
        nextCatalog[index] = nextProduct
      } else {
        nextCatalog.push(nextProduct)
      }

      return {
        ...current,
        catalog: nextCatalog
      }
    })

    setProductEditorOpen(false)
    setMessage(productForm.id ? 'Product updated' : 'Product added')
  }

  function deleteProduct(productId: string) {
    commit((current) => ({
      ...current,
      catalog: current.catalog.filter((product) => product.id !== productId),
      productCounts: Object.fromEntries(Object.entries(current.productCounts).filter(([id]) => id !== productId))
    }))
  }

  function copySummary() {
    const text = buildSummaryText({
      dateLabel: formatDateLabel(state.dateKey),
      milk: state.milk,
      productCounts: state.productCounts,
      catalog
    })
    void navigator.clipboard.writeText(text)
    setMessage('Summary copied')
  }

  const breakdown = formatMilkBreakdown(state.milk.breakdown)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.16),_transparent_36%),linear-gradient(180deg,_#08111f_0%,_#050914_100%)] text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 pb-32 pt-3 sm:px-4">
        <header className="sticky top-0 z-30 rounded-[1.5rem] border border-white/10 bg-ink-900/90 px-4 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">Coach Dairy Counter</p>
              <h1 className="mt-1 text-2xl font-semibold">Fast daily sales board</h1>
            </div>
            <button type="button" onClick={() => setResetOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200">
              <ArchiveRestore className="h-4 w-4" />
              Reset
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatCard label="Today's Date" value={formatDateLabel(state.dateKey)} tone="slate" />
            <StatCard label="Today's Total Revenue" value={`Rs ${money.format(totalRevenue)}`} hint="Milk + products" tone="mint" />
            <StatCard label="Milk Total" value={`${totalMilkLitres.toFixed(totalMilkLitres % 1 ? 1 : 0)}L`} hint="Cash and credit" tone="amber" />
          </div>
        </header>

        <section className="mt-3 flex-1">
          {screen === 'home' ? (
            <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                <MilkCard
                  cashRate={state.milk.cashRate}
                  creditRate={state.milk.creditRate}
                  onCashRateChange={(value) => setMilkRates(value, state.milk.creditRate)}
                  onCreditRateChange={(value) => setMilkRates(state.milk.cashRate, value)}
                  onMilkSale={addMilk}
                  onOpenCustom={(payment) => {
                    setCustomMilkPayment(payment)
                    setCustomMilkOpen(true)
                  }}
                />

                <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-soft">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">Quick Counter</h2>
                      <p className="text-sm text-slate-400">Milk stays on top. Other common items are one thumb away.</p>
                    </div>
                    <button type="button" onClick={() => setScreen('categories')} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                      Categories
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {quickProducts.map((product) => {
                      const count = state.productCounts[product.id]?.quantity ?? 0
                      return <ProductTile key={product.id} product={product} quantity={count} onIncrease={() => adjustProduct(product.id, 1)} onDecrease={() => adjustProduct(product.id, -1)} />
                    })}
                  </div>
                </section>
              </div>

              <aside className="space-y-3">
                <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">Milk Breakdown</h2>
                      <p className="text-sm text-slate-400">Counts by sale size.</p>
                    </div>
                    <MoonStar className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div className="mt-4 grid gap-3">
                    {breakdown.length > 0 ? (
                      breakdown.map((item) => (
                        <div key={item.quantity} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                          <span className="text-sm text-slate-300">{item.quantity}</span>
                          <span className="text-lg font-semibold text-white">× {item.count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-8 text-center text-sm text-slate-400">No milk recorded yet.</p>
                    )}
                  </div>
                </section>

                <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-soft">
                  <h2 className="text-lg font-semibold">Milk Totals</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <StatCard label="Cash Litres" value={`${state.milk.cashLitres.toFixed(state.milk.cashLitres % 1 ? 1 : 0)}L`} tone="mint" />
                    <StatCard label="Credit Litres" value={`${state.milk.creditLitres.toFixed(state.milk.creditLitres % 1 ? 1 : 0)}L`} tone="rose" />
                    <StatCard label="Total Litres" value={`${totalMilkLitres.toFixed(totalMilkLitres % 1 ? 1 : 0)}L`} tone="slate" />
                    <StatCard label="Milk Revenue" value={`Rs ${money.format(state.milk.cashRevenue + state.milk.creditRevenue)}`} tone="amber" />
                  </div>
                </section>
              </aside>
            </div>
          ) : null}

          {screen === 'categories' ? (
            <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Categories</h2>
                  <p className="mt-1 text-sm text-slate-400">Add, edit, or remove products. Prices stay editable for tomorrow.</p>
                </div>
                <button type="button" onClick={() => openProductEditor()} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-ink-950">
                  <Plus className="h-4 w-4" />
                  Add Product
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {PRODUCT_CATEGORIES.map((category) => {
                  const items = catalog.filter((product) => product.category === category)
                  if (items.length === 0) return null
                  return (
                    <div key={category} className={`rounded-2xl border border-white/10 bg-gradient-to-br p-3 ${CATEGORY_COLORS[category]}`}>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">{category}</h3>
                      <div className="mt-3 space-y-2">
                        {items.map((product) => (
                          <div key={product.id} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-white">{product.name}</p>
                                <p className="text-xs text-slate-300">Rs {product.price.toFixed(0)}</p>
                              </div>
                              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">{state.productCounts[product.id]?.quantity ?? 0}</span>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              <button type="button" onClick={() => adjustProduct(product.id, 1)} className="rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-ink-950">+1</button>
                              <button type="button" onClick={() => openProductEditor(product)} className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold text-white">Edit</button>
                              <button type="button" onClick={() => deleteProduct(product.id)} className="rounded-2xl bg-rose-500/90 px-3 py-2 text-sm font-semibold text-white">Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ) : null}

          {screen === 'summary' ? (
            <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Summary</h2>
                  <p className="mt-1 text-sm text-slate-400">A clean day-end report you can copy into a notebook or WhatsApp message.</p>
                </div>
                <button type="button" onClick={copySummary} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-ink-950">
                  <Save className="h-4 w-4" />
                  Copy Summary
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Milk Cash" value={`${state.milk.cashLitres.toFixed(state.milk.cashLitres % 1 ? 1 : 0)}L`} tone="mint" />
                <StatCard label="Milk Credit" value={`${state.milk.creditLitres.toFixed(state.milk.creditLitres % 1 ? 1 : 0)}L`} tone="rose" />
                <StatCard label="Total Milk" value={`${totalMilkLitres.toFixed(totalMilkLitres % 1 ? 1 : 0)}L`} tone="slate" />
                <StatCard label="Total Revenue" value={`Rs ${money.format(totalRevenue)}`} tone="amber" />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm uppercase tracking-[0.22em] text-slate-400">Every Product Sold</h3>
                <div className="mt-3 space-y-2">
                  {catalog
                    .filter((product) => (state.productCounts[product.id]?.quantity ?? 0) > 0)
                    .map((product) => {
                      const count = state.productCounts[product.id]!
                      return (
                        <div key={product.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                          <div>
                            <p className="font-semibold text-white">{product.name}</p>
                            <p className="text-xs text-slate-400">{count.quantity} sold</p>
                          </div>
                          <p className="text-lg font-semibold text-white">Rs {money.format(count.revenue)}</p>
                        </div>
                      )
                    })}
                </div>
              </div>
            </section>
          ) : null}
        </section>

        <nav className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-1rem)] max-w-xl -translate-x-1/2 rounded-[1.5rem] border border-white/10 bg-ink-900/90 px-2 py-2 shadow-soft backdrop-blur">
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setScreen('home')} className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${screen === 'home' ? 'bg-emerald-500 text-ink-950' : 'bg-white/5 text-slate-200'}`}>
              <Store className="h-4 w-4" />
              Home
            </button>
            <button type="button" onClick={() => setScreen('categories')} className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${screen === 'categories' ? 'bg-emerald-500 text-ink-950' : 'bg-white/5 text-slate-200'}`}>
              <LayoutGrid className="h-4 w-4" />
              Categories
            </button>
            <button type="button" onClick={() => setScreen('summary')} className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${screen === 'summary' ? 'bg-emerald-500 text-ink-950' : 'bg-white/5 text-slate-200'}`}>
              <Check className="h-4 w-4" />
              Summary
            </button>
          </div>
        </nav>

        <FloatingActions canUndo={state.history.length > 0} onUndo={undoLastAction} onCopy={copySummary} />

        {message ? <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-ink-900 px-4 py-2 text-sm text-white shadow-soft">{message}</div> : null}
      </main>

      <Modal open={customMilkOpen} title="Custom Milk" description="Enter litres for a one-off milk sale." onClose={() => setCustomMilkOpen(false)}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => setCustomMilkPayment('cash')} className={`rounded-2xl px-4 py-4 text-base font-semibold ${customMilkPayment === 'cash' ? 'bg-emerald-500 text-ink-950' : 'bg-white/5 text-white'}`}>
              Cash
            </button>
            <button type="button" onClick={() => setCustomMilkPayment('credit')} className={`rounded-2xl px-4 py-4 text-base font-semibold ${customMilkPayment === 'credit' ? 'bg-rose-500 text-white' : 'bg-white/5 text-white'}`}>
              Credit
            </button>
          </div>
          <label className="block">
            <span className="text-sm text-slate-300">Enter litres</span>
            <input type="number" min="0" step="0.5" value={customMilkValue} onChange={(event) => setCustomMilkValue(event.target.value)} placeholder="6.5" className="mt-2 w-full rounded-2xl border border-white/10 bg-ink-800 px-4 py-4 text-xl font-semibold text-white outline-none" />
          </label>
          <button type="button" onClick={addCustomMilk} className="w-full rounded-2xl bg-emerald-500 px-4 py-4 text-base font-semibold text-ink-950">
            Add
          </button>
        </div>
      </Modal>

      <Modal open={productEditorOpen} title={productForm.id ? 'Edit Product' : 'Add Product'} description="Name, category, and selling price are saved locally." onClose={() => setProductEditorOpen(false)}>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">Product name</span>
            <input type="text" value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 w-full rounded-2xl border border-white/10 bg-ink-800 px-4 py-4 text-lg font-semibold text-white outline-none" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-slate-300">Category</span>
              <select value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value as ProductFormValues['category'] }))} className="mt-2 w-full rounded-2xl border border-white/10 bg-ink-800 px-4 py-4 text-base font-semibold text-white outline-none">
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category} className="bg-ink-900">
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Selling price</span>
              <input type="number" min="0" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} className="mt-2 w-full rounded-2xl border border-white/10 bg-ink-800 px-4 py-4 text-lg font-semibold text-white outline-none" />
            </label>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
            <input type="checkbox" checked={productForm.quick} onChange={(event) => setProductForm((current) => ({ ...current, quick: event.target.checked }))} className="h-5 w-5 rounded border-white/20 bg-ink-800" />
            Show on quick counter
          </label>
          <button type="button" onClick={saveProduct} className="w-full rounded-2xl bg-emerald-500 px-4 py-4 text-base font-semibold text-ink-950">
            Save Product
          </button>
        </div>
      </Modal>

      <Modal open={resetOpen} title="Reset Day" description="This clears all counters for today, but keeps products and prices." onClose={() => setResetOpen(false)}>
        <div className="space-y-4">
          <button type="button" onClick={resetDay} className="w-full rounded-2xl bg-rose-500 px-4 py-4 text-base font-semibold text-white">
            Reset all counters
          </button>
          <button type="button" onClick={() => setResetOpen(false)} className="w-full rounded-2xl bg-white/5 px-4 py-4 text-base font-semibold text-white">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}