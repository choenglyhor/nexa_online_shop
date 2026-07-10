
const ADMIN_PRODUCTS_KEY = 'nexashop_products'
const OVERRIDES_KEY      = 'nexashop_product_overrides'   // edits to FakeStore products, keyed by fakestore id
const DELETED_KEY        = 'nexashop_deleted_fakestore_ids'
const CHANGE_EVENT       = 'nexashop:products-changed'

// ─── Admin-created products ───────────────────────────────────────────────────
export const getAdminProducts  = () => JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY) || '[]')
export const saveAdminProducts = (list) => {
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(list))
  notifyChange()
}

// ─── Overrides for FakeStore products (admin edits) ──────────────────────────
export const getOverrides  = () => JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}')
export const saveOverride  = (fakeId, patch) => {
  const overrides = getOverrides()
  overrides[fakeId] = { ...(overrides[fakeId] || {}), ...patch }
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))
  notifyChange()
}
export const removeOverride = (fakeId) => {
  const overrides = getOverrides()
  delete overrides[fakeId]
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))
  notifyChange()
}

// ─── Deleted FakeStore ids (hidden from Shop) ─────────────────────────────────
export const getDeletedIds = () => JSON.parse(localStorage.getItem(DELETED_KEY) || '[]')
export const markDeleted   = (fakeId) => {
  const ids = getDeletedIds()
  if (!ids.includes(fakeId)) {
    localStorage.setItem(DELETED_KEY, JSON.stringify([...ids, fakeId]))
    notifyChange()
  }
}
export const restoreDeleted = (fakeId) => {
  localStorage.setItem(DELETED_KEY, JSON.stringify(getDeletedIds().filter((id) => id !== fakeId)))
  notifyChange()
}

// ─── Apply overrides + filter deletions onto a raw FakeStore product list ────
export const applyOverridesAndDeletes = (fakeProducts) => {
  const overrides = getOverrides()
  const deleted   = getDeletedIds()
  return fakeProducts
    .filter((p) => !deleted.includes(p.id))
    .map((p) => overrides[p.id] ? { ...p, ...overrides[p.id] } : p)
}

// ─── Live update event ────────────────────────────────────────────────────────
// Dashboard calls notifyChange() (via the setters above) whenever it writes.
// Shop.jsx listens for this so changes reflect instantly in the same tab,
// without needing a page refresh or window focus.
function notifyChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export const onProductsChanged = (callback) => {
  window.addEventListener(CHANGE_EVENT, callback)
  return () => window.removeEventListener(CHANGE_EVENT, callback)
}

export const PRODUCTS_CHANGE_EVENT = CHANGE_EVENT