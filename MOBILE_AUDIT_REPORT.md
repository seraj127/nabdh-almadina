# Mobile App Code Audit Report — Task 1-b

**Project:** City Pulse (نبض المدينة)  
**Scope:** `/src/components/mobile/` — all screens, components, and lib files  
**Date:** 2025-03-04  

---

## 🔴 CRITICAL: Duplicate Files

### 1. THREE Product Detail Implementations (4 files)

| File | Export | Used? | Lines | Features |
|------|--------|-------|-------|----------|
| `components/product-detail-screen.tsx` | `ProductDetailScreen` | ✅ YES (mobile-app.tsx) | ~1100 | Full-screen, zoom, reviews from API, specs, video, badges |
| `screens/product-detail-screen.tsx` | `ProductDetailScreen` | ❌ NOT imported | ~1500+ | Full-screen, advanced zoom/magnifier/pinch, specs from attributes, mock reviews, write review |
| `screens/product-detail-overlay.tsx` | `ProductDetailOverlay` | ❌ NOT imported | ~493 | Overlay variant, zoom, related products, fake reviews, tabs |
| `product-detail-overlay.tsx` (root) | `ProductDetailOverlay` | ❌ NOT imported | ~109 | Minimal overlay, basic image gallery, add to cart |

**Active version:** `components/product-detail-screen.tsx` is imported in `mobile-app.tsx` line 23.

**Orphaned files:**
- `screens/product-detail-screen.tsx` — newer/advanced version with magnifier/pinch zoom, but NOT used
- `screens/product-detail-overlay.tsx` — overlay variant, NOT used  
- `product-detail-overlay.tsx` (root) — minimal version, NOT used

**Recommendation:** Delete the 3 orphaned files. If the `screens/product-detail-screen.tsx` features (magnifier, pinch zoom, write review) are desired, merge them into `components/product-detail-screen.tsx`.

---

### 2. THREE Delivery Data Files (all contain the same Libyan cities/prices)

| File | Export | Type | Used? |
|------|--------|------|-------|
| `lib/delivery-data.ts` | `LIBYA_DELIVERY_DATA`, helpers | `DeliveryArea`/`DeliveryRegion` | ✅ checkout-flow.tsx, checkout-screen.tsx |
| `lib/delivery-zones.ts` | `DELIVERY_REGIONS`, helpers | `DeliveryZone`/`DeliveryRegion` | ✅ delivery-zones-screen.tsx, mobile-app.tsx |
| `lib/libya-delivery-data.ts` | `DELIVERY_REGIONS`, helpers | `DeliveryLocation`/`DeliveryRegion` | ✅ order-tracking.tsx (via `require()`) |

**Problems:**
- All three contain the SAME 146+ Libyan delivery zones with the SAME prices and durations
- All three define **different interfaces** (`DeliveryArea`, `DeliveryZone`, `DeliveryLocation`) for essentially the same data
- `delivery-zones.ts` exports a `DeliveryRegion` type that **conflicts** with `delivery-data.ts`'s `DeliveryRegion` type (different shape)
- `libya-delivery-data.ts` has `DeliveryRegion` with `districts?` field while `delivery-data.ts` has `areas` field
- Minor data inconsistencies: `delivery-data.ts` has Tripoli areas up to `الأزهاري` (70+ areas), while `libya-delivery-data.ts` has different end entries
- `delivery-zones.ts` has `nameEn` values in Arabic (e.g., `'أبوسليم'`) instead of English transliteration (unlike `libya-delivery-data.ts` which has proper English like `'Abusleem'`)

**Recommendation:** Consolidate into a single `lib/delivery-data.ts` with proper bilingual support. Delete the other two.

---

### 3. TWO Privacy Screen Files + a THIRD inline version

| File | Export | Used? |
|------|--------|-------|
| `screens/privacy-screen.tsx` | `PrivacyScreen` | ❌ NOT imported in mobile-app.tsx |
| `screens/privacy-policy-screen.tsx` | `PrivacyPolicyScreen` | ✅ YES (mobile-app.tsx line 31) |
| `screens/account-screen.tsx` line 1966 | `PrivacyScreen` (local) | ✅ Used within account-screen |

**Details:**
- `privacy-screen.tsx` — older version, always-expanding sections, gradient header
- `privacy-policy-screen.tsx` — newer, expandable accordion sections, more professional design
- `account-screen.tsx` also defines its OWN `PrivacyScreen` component inline at line 1966, which is yet ANOTHER version

**Recommendation:** Delete `screens/privacy-screen.tsx`. Extract the inline `PrivacyScreen` from `account-screen.tsx` and use the shared `PrivacyPolicyScreen` instead.

---

### 4. TWO Order Tracking Screen Files

| File | Export | Signature | Used? |
|------|--------|-----------|-------|
| `screens/order-tracking.tsx` | `OrderTrackingScreen` | `{ orderNumber, onClose }` | ✅ YES (mobile-app.tsx, profile-tab.tsx, account-screen.tsx) |
| `screens/order-tracking-screen.tsx` | `OrderTrackingScreen` | `()` (no props) | ❌ NOT imported |

**Critical Bug in `order-tracking-screen.tsx`:** It calls `useMobileStore((s) => s.trackOrder)` on line 26, but **`trackOrder` does NOT exist** in `mobile-store.ts`. This will cause a **runtime error** if this component is ever used.

**Details:**
- `order-tracking.tsx` — professional, full-featured with API fetch, timeline, order summary, delivery info
- `order-tracking-screen.tsx` — simpler search-based tracking, uses missing `trackOrder` method

**Recommendation:** Delete `screens/order-tracking-screen.tsx`. It references a non-existent store method and is not imported anywhere.

---

### 5. TWO Profile Screen Files

| File | Export | Used? |
|------|--------|-------|
| `screens/profile-screen.tsx` | `ProfileTab` | ❌ NOT imported in mobile-app.tsx |
| `screens/profile-tab.tsx` | `ProfileTab` | ✅ YES (mobile-app.tsx) |

**Details:**
- Both export a component named `ProfileTab`
- `profile-screen.tsx` is the older version with inline edit profile, about app, change password
- `profile-tab.tsx` is the newer version that imports `AdvancedSettingsScreen` from `settings-screen.tsx` and `OrderTrackingScreen` from `order-tracking.tsx`

**Recommendation:** Delete `screens/profile-screen.tsx`.

---

### 6. TWO Nav Favorites Icon Files

| File | Export | Used? |
|------|--------|-------|
| `components/nav-fav-icon.tsx` | `NavFavIcon` | ❌ NOT imported anywhere |
| `components/nav-favorites-icon.tsx` | `NavFavoritesIcon` | ❌ NOT imported anywhere |

**Details:**
- `NavFavIcon` — uses plain `Heart` icon from lucide-react
- `NavFavoritesIcon` — uses `Nav3DFavoritesIcon` from `nav-3d-icons.tsx`
- Both have identical badge animation logic (duplicated code)
- Neither is imported — the app uses `Nav3DHeartIcon` from `nav-3d-icons.tsx` directly

**Recommendation:** Delete both files. They are dead code.

---

## 🟡 BUGS FOUND

### Bug 1: `trackOrder` method missing from mobile-store (CRITICAL)
- **File:** `screens/order-tracking-screen.tsx` line 26
- **Issue:** `useMobileStore((s) => s.trackOrder)` — this method does NOT exist in `mobile-store.ts`
- **Impact:** Runtime error if component is ever rendered
- **Status:** Currently safe since the file is not imported, but would break if anyone tried to use it

### Bug 2: `require()` used instead of `import` in order-tracking.tsx
- **File:** `screens/order-tracking.tsx` lines 421, 471
- **Issue:** Uses `require('../lib/libya-delivery-data')` inside `useMemo` callbacks
- **Impact:** Works in Next.js but bypasses tree-shaking and type checking. Also causes the module to be loaded dynamically on each render cycle
- **Fix:** Replace with static `import { getDeliveryDuration } from '../lib/libya-delivery-data'` at the top

### Bug 3: Duplicate `OrderTrackingScreen` rendering in mobile-app.tsx
- **File:** `mobile-app.tsx` lines 104-115
- **Issue:** Two separate conditional blocks render `OrderTrackingScreen`:
  ```tsx
  {screen === 'order-tracking' && <OrderTrackingScreen ... />}
  {(screen === 'orderDetail' || screen === 'orderTracking') && <OrderTrackingScreen ... />}
  ```
- **Impact:** If `screen === 'order-tracking'`, only the first block renders (correct). If `screen === 'orderTracking'`, the second block renders. But `screen === 'orderDetail'` also renders the same component — this could cause layout issues since both blocks use `absolute` positioning.
- **Fix:** Merge into a single conditional: `{['order-tracking', 'orderDetail', 'orderTracking'].includes(screen) && ...}`

### Bug 4: Inconsistent `Screen` type with actual usage
- **File:** `lib/types.ts` line 3
- **Issue:** The `Screen` type includes `'order-tracking'` and `'orderDetail'` and `'orderTracking'`, but there's no screen value for privacy screen from `privacy-screen.tsx` (it uses `'privacy-policy'` which IS in the type). The three order-related screen values are redundant.
- **Fix:** Consolidate to a single `'order-tracking'` screen value

### Bug 5: `delivery-data.ts` and `delivery-zones.ts` both export `DeliveryRegion` with different shapes
- **Files:** `lib/delivery-data.ts`, `lib/delivery-zones.ts`
- **Issue:** TypeScript would get confused if both are imported in the same file
- **Impact:** Potential type confusion bugs if a file imports from both

### Bug 6: `checkout-flow.tsx` uses `require()` for delivery data
- **Similar to Bug 2** — uses `require('../lib/libya-delivery-data')` instead of static imports

### Bug 7: Fake/random data used in product detail views
- **File:** `screens/product-detail-overlay.tsx` line 38
- **Issue:** `viewsCount = useMemo(() => Math.floor(Math.random() * 500 + 100), [product.id])` — generates random views count that changes on every product switch
- **Impact:** Shows misleading data to users

### Bug 8: `privacy-policy-screen.tsx` unused imports
- **File:** `screens/privacy-policy-screen.tsx`  
- **Issue:** Imports `FileText`, `CalendarDays` but these are not used in the component (they're replaced by inline section data)

---

## 🟠 CODE QUALITY ISSUES

### 1. Massive code duplication in product detail files
Four separate implementations of essentially the same UI (product gallery, price display, add to cart). The core logic (image parsing, discount calculation, add to cart) is duplicated across all four.

### 2. `order-tracking.tsx` uses `require()` instead of `import`
Two `require()` calls inside `useMemo` for `getDeliveryDuration`. This is a Next.js anti-pattern.

### 3. Inconsistent component placement
- Product detail components split between `components/` and `screens/` directories
- `product-detail-overlay.tsx` at the root level (should be in `components/` or `screens/`)
- Order tracking split between `screens/order-tracking.tsx` (used) and `screens/order-tracking-screen.tsx` (unused)

### 4. Brand color constants duplicated across many files
`COLORS`/`BRAND` objects with the same values are defined independently in:
- `screens/privacy-policy-screen.tsx`
- `screens/order-tracking.tsx`
- `screens/chat-screen.tsx`
- `screens/account-screen.tsx`
- `screens/checkout-flow.tsx`
- `lib/design-tokens.ts` (the canonical source)

**Fix:** All files should import from `design-tokens.ts`

### 5. Unused lucide-react imports across files
Many screen files import icons that are never used in the component (leftover from development).

### 6. `delivery-zones.ts` English names are just Arabic transliterations
Unlike `libya-delivery-data.ts` which has proper English translations (e.g., `'Abusleem'`, `'Gargaresh'`), `delivery-zones.ts` puts Arabic names in the `nameEn` field (e.g., `'أبوسليم'`, `'قرقارش'`).

### 7. `mobile-app.tsx` has massive unused lucide-react import block
Lines 36-41 import ~30 icons, but many are not used in the component (e.g., `Star`, `Plus`, `Minus`, `Trash2`, `RefreshCw`, `Phone`, `Lock`, `Eye`, `EyeOff`, `Settings`, `KeyRound`, `Mail`, `Zap`, `Flame`, `Timer`, `Loader2`).

### 8. Inconsistent import paths
Some files use `@/components/mobile/lib/mobile-store` while others use `../lib/mobile-store`. This inconsistency makes refactoring harder.

---

## 📋 FILE-BY-FILE SUMMARY

### Files to DELETE (dead/orphaned code):

| File | Reason |
|------|--------|
| `product-detail-overlay.tsx` (root) | Superseded by `components/product-detail-screen.tsx`, not imported |
| `screens/product-detail-overlay.tsx` | Not imported, duplicate of `components/product-detail-screen.tsx` |
| `screens/product-detail-screen.tsx` | Not imported, advanced version of `components/product-detail-screen.tsx` but unused |
| `screens/privacy-screen.tsx` | Superseded by `screens/privacy-policy-screen.tsx`, not imported |
| `screens/order-tracking-screen.tsx` | Not imported, calls non-existent `trackOrder` method |
| `screens/profile-screen.tsx` | Superseded by `screens/profile-tab.tsx`, not imported |
| `components/nav-fav-icon.tsx` | Not imported anywhere |
| `components/nav-favorites-icon.tsx` | Not imported anywhere |
| `lib/delivery-zones.ts` | Duplicate of `delivery-data.ts`, consolidate |
| `lib/libya-delivery-data.ts` | Duplicate of `delivery-data.ts`, consolidate |

### Files needing BUG FIXES:

| File | Bug |
|------|-----|
| `screens/order-tracking.tsx` | Replace `require()` with `import` (lines 421, 471) |
| `mobile-app.tsx` | Merge duplicate `OrderTrackingScreen` rendering blocks |
| `lib/types.ts` | Consolidate redundant screen types (`order-tracking`, `orderDetail`, `orderTracking`) |
| `screens/product-detail-overlay.tsx` (if kept) | Remove random `viewsCount` |

### Files needing CODE QUALITY improvements:

| File | Issue |
|------|-------|
| Multiple screen files | Extract brand COLORS to `design-tokens.ts` imports |
| `mobile-app.tsx` | Remove ~15 unused lucide-react imports |
| `screens/privacy-policy-screen.tsx` | Remove unused imports (`FileText`, `CalendarDays`, etc.) |
| `lib/delivery-data.ts` | Add proper English translations for all zones (currently Arabic-only `name` field) |
| Multiple files | Normalize import paths to use `../lib/mobile-store` consistently |

---

## 📊 STATISTICS

| Metric | Count |
|--------|-------|
| Total files audited | 55 |
| Duplicate/orphaned files | 10 |
| Critical bugs | 3 |
| Medium bugs | 5 |
| Code quality issues | 8 |
| Lines of dead code (estimated) | ~3,500+ |

---

## ✅ RECOMMENDED CLEANUP ORDER

1. **Delete the 10 orphaned/dead files** listed above (immediate, zero risk)
2. **Fix Bug 2:** Replace `require()` with `import` in `order-tracking.tsx`
3. **Fix Bug 3:** Merge duplicate `OrderTrackingScreen` rendering in `mobile-app.tsx`
4. **Fix Bug 4:** Consolidate `Screen` type in `types.ts`
5. **Consolidate delivery data:** Merge all three files into `delivery-data.ts`
6. **Extract brand constants:** Replace inline `COLORS`/`BRAND` with `design-tokens.ts` imports
7. **Clean up unused imports** in `mobile-app.tsx` and other files
8. **If advanced product detail features are desired:** Merge `screens/product-detail-screen.tsx` features (magnifier, pinch zoom, write review) into `components/product-detail-screen.tsx` before deleting
