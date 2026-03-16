# Ecommerce Admin Dashboard

React 19 · Vite 6 · TailwindCSS v4 · Shadcn UI · React Query v5 · Zustand v5 · React Router v7

## Current Backend State

Fully-built NestJS REST API at `http://localhost:3000/api/v1`:

- **Auth**: JWT access token (Bearer) + HTTP-only refresh token cookie. `GET /auth/me` returns `{ id, email, roles: string[], permissions: string[] }`.
- **Permission model**: `action:subject` strings embedded in JWT (e.g. `read:product`). SUPER_ADMIN has `manage:all` which bypasses all checks.
- **Roles**: `SUPER_ADMIN` (manage:all), `ADMIN` (product/category/order/review/coupon/analytics), `CUSTOMER` (limited – no dashboard access).
- **All responses paginated** as `{ data: T[], meta: { total, page, limit, totalPages, hasNextPage, hasPreviousPage } }`.
- **File uploads**: multipart to `POST /files/upload` (single) and `POST /files/upload-multiple` (up to 10), requires `create:product` permission.

## Tech Stack

- `react@19`, `react-dom@19`, `typescript@5`
- `vite@6`, `@tailwindcss/vite@4` (replaces the old PostCSS plugin – **no tailwind.config.ts**)
- `tailwindcss@4` – configured entirely via CSS `@import "tailwindcss"` + `@theme {}`
- `shadcn/ui` latest (v4-compatible, initialized with `npx shadcn@latest init`)
- `react-router-dom@7`
- `@tanstack/react-query@5` + `@tanstack/react-query-devtools`
- `zustand@5`
- `axios@1`
- `react-hook-form@7` + `@hookform/resolvers@3` + `zod@3`
- `lucide-react`, `sonner` (toast), `recharts` (dashboard charts)
- `date-fns@3`
- **Testing**: `vitest@2`, `@testing-library/react@16`, `@testing-library/user-event@14`, `@testing-library/jest-dom@6`, `msw@2` (API mocking), `happy-dom` (test environment), `@vitest/coverage-v8`

## Permission Matrix

Each sidebar route is visible and accessible only when the user holds the listed permission(s). `manage:all` satisfies any check.
Dashboard Home → `read:analytics`
Users → `read:user`
Roles & Permissions → `read:role`
Products → `read:product`
Categories → `read:category`
Orders → `read:order`
Coupons → `read:coupon`
Reviews → `read:review`
Dashboard access guard: user must have at least one non-customer permission (anything outside `{ read:product, create:order, create:review, read:order-own, manage:cart, manage:wishlist, manage:address }`). Pure CUSTOMER-role users are redirected to a 403 page.

## Directory Structure

```warp-runnable-command
src/
├── api/
│   ├── client.ts          # Axios instance + interceptors
│   ├── auth.api.ts
│   ├── users.api.ts
│   ├── roles.api.ts
│   ├── products.api.ts
│   ├── categories.api.ts
│   ├── orders.api.ts
│   ├── coupons.api.ts
│   ├── reviews.api.ts
│   └── files.api.ts
├── hooks/                 # React Query hooks per domain
│   ├── use-auth.ts
│   ├── use-users.ts
│   ├── use-roles.ts
│   ├── use-products.ts
│   ├── use-categories.ts
│   ├── use-orders.ts
│   ├── use-coupons.ts
│   └── use-reviews.ts
├── stores/
│   └── auth.store.ts      # Zustand: user, accessToken, permissions
├── components/
│   ├── ui/                # Shadcn generated components
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SidebarItem.tsx
│   │   └── Header.tsx
│   └── shared/
│       ├── DataTable.tsx
│       ├── PageHeader.tsx
│       ├── ConfirmDialog.tsx
│       ├── StatusBadge.tsx
│       ├── PaginationBar.tsx
│       ├── ImageUpload.tsx
│       ├── PermissionGuard.tsx
│       └── EmptyState.tsx
├── pages/
│   ├── auth/LoginPage.tsx
│   ├── dashboard/DashboardPage.tsx
│   ├── users/
│   │   ├── UsersPage.tsx
│   │   └── UserDetailPage.tsx
│   ├── roles/
│   │   ├── RolesPage.tsx
│   │   └── RoleDetailPage.tsx
│   ├── products/
│   │   ├── ProductsPage.tsx
│   │   └── ProductFormPage.tsx
│   ├── categories/CategoriesPage.tsx
│   ├── orders/
│   │   ├── OrdersPage.tsx
│   │   └── OrderDetailPage.tsx
│   ├── coupons/CouponsPage.tsx
│   ├── reviews/ReviewsPage.tsx
│   └── errors/
│       ├── NotFoundPage.tsx
│       └── ForbiddenPage.tsx
├── router/
│   ├── index.tsx          # createBrowserRouter definition
│   ├── routes.config.ts   # Route objects with required permissions
│   └── AuthGuard.tsx      # Redirects unauthenticated users
├── types/
│   ├── api.types.ts       # PaginatedResponse, ApiError
│   ├── auth.types.ts
│   ├── user.types.ts
│   ├── role.types.ts
│   ├── product.types.ts
│   ├── category.types.ts
│   ├── order.types.ts
│   ├── coupon.types.ts
│   └── review.types.ts
├── lib/utils.ts           # cn(), formatCurrency(), formatDate()
├── App.tsx
├── main.tsx
└── index.css              # @import "tailwindcss" + @theme{} + CSS vars
```

## Key API Contracts

### Auth

`POST /auth/login` — body: `{ email, password }` — response: `{ user: UserSafe, accessToken: string }` + sets `refreshToken` httpOnly cookie.
`GET /auth/me` — response: `{ id, email, roles: string[], permissions: string[] }` — used on app boot to hydrate store.
`POST /auth/refresh` — no body (reads cookie) — response: `{ accessToken: string }` + rotates cookie.
`POST /auth/logout` — clears cookie, invalidates token.

### Users

`GET /users?page&limit&sortBy&sortOrder` → `PaginatedResponse<UserSafe>`
`POST /users` — body: `{ email, password, firstName, lastName, phone?, roleId?, isActive? }` → `UserSafe`
`PATCH /users/:id` — body: `{ email?, firstName?, lastName?, phone?, avatar?, isActive?, roleId?, password? }` → `UserSafe`
`PATCH /users/:id/restore` → `UserSafe`
`DELETE /users/:id` → `204`
`UserSafe`: `{ id, email, firstName, lastName, phone, avatar, isActive, createdAt, updatedAt, roles: [{ role: { id, name } }] }`

### Roles & Permissions

`GET /roles` → `Role[]`
`GET /permissions` → `Permission[]`
`POST /roles` — body: `{ name, description?, permissionIds?: string[] }` → `Role`
`PATCH /roles/:id` — body: `{ name?, description?, permissionIds?: string[] }` → `Role`
`POST /roles/assign` — body: `{ userId, roleId }` → `UserRole`
`POST /roles/revoke` — body: `{ userId, roleId }` → `204`
`Role`: `{ id, name, description, createdAt, updatedAt, permissions: [{ permission: { id, action, subject, description } }] }`

### Products

`GET /products/admin/all?page&limit&search&categoryId&minPrice&maxPrice&isActive&isFeatured&sortBy&sortOrder` → `PaginatedResponse<Product>`
`POST /products` — body: `{ name, price, sku, description?, shortDescription?, compareAtPrice?, costPrice?, stock?, lowStockThreshold?, weight?, isActive?, isFeatured?, categoryId? }` → `Product`
`PATCH /products/:id` — same optional fields → `Product`
`PATCH /products/:id/stock` — body: `{ quantity: number, operation: 'set'|'increment'|'decrement' }` → `Product`
`POST /products/:id/images` — body: `{ images: [{url, alt?, sortOrder?}] }` → `Product`
`PATCH /products/:id/images/reorder` — body: `{ imageIds: string[] }` → `Product`
`DELETE /products/images/:imageId` → `204`
`DELETE /products/:id` → `204` `PATCH /products/:id/restore` → `Product`

### Categories

`GET /categories/admin` → `Category[]` (all including inactive)
`POST /categories` — body: `{ name, description?, parentId?, image?, sortOrder?, isActive? }` → `Category`
`PATCH /categories/:id` — same optional → `Category`
`DELETE /categories/:id?force=true` → `204`

### Orders

`GET /orders/admin?page&limit&status&dateFrom&dateTo&sortBy&sortOrder` → `PaginatedResponse<OrderAdmin>`
`GET /orders/admin/stats` → `{ totalOrders, totalRevenue, ordersByStatus: Record<string,number>, averageOrderValue, recentOrders }`
`PATCH /orders/:id/status` — body: `{ status: OrderStatus }` → `OrderAdmin`
`OrderAdmin`: `{ id, orderNumber, userId, status, subtotalAmount, shippingAmount, taxAmount, discountAmount, totalAmount, shippingAddressSnapshot, billingAddressSnapshot, couponId, notes, shippedAt, deliveredAt, cancelledAt, createdAt, updatedAt, items: OrderItem[], payment: Payment|null, coupon: {id,code,discountType,discountValue}|null, user: {id,email,firstName,lastName} }`

### Coupons

`GET /coupons?page&limit` → `PaginatedResponse<Coupon>`
`POST /coupons` — body: `{ code, discountType, discountValue, description?, minOrderAmount?, maxDiscountAmount?, maxUses?, isActive?, startsAt?, expiresAt? }` → `Coupon`

### Reviews

`GET /reviews/pending?page&limit` → `PaginatedResponse<Review>`
`PATCH /reviews/:id/approve` → `Review` `PATCH /reviews/:id/reject` → `Review`
`DELETE /reviews/admin/:id` → `204`

### Files

`POST /files/upload` — multipart `file` field → `{ url: string, filename: string }`
`POST /files/upload-multiple` — multipart `files[]` field → `{ urls: string[], filenames: string[] }`

## Phase 1 — Project Setup & Foundation

- [x] Scaffold project: React + Vite + TypeScript — **already done**
- [x] Upgrade to React 19: `pnpm add react@19 react-dom@19 @types/react@19 @types/react-dom@19`
- [x] Install TailwindCSS v4 — **already done**
- [x] Add `@tailwindcss/vite` to `vite.config.ts` plugins array — **already done**
- [x] Set up `src/index.css` with `@import "tailwindcss";` and `@theme {}` CSS variables — **already done**
- [x] Install and init Shadcn UI (`pnpm dlx shadcn@latest init`) — **already done**
- [x] Add initial Shadcn components: `pnpm dlx shadcn@latest add button input label form table badge dialog dropdown-menu card separator avatar sheet select checkbox switch skeleton tooltip popover command calendar alert`
- [x] Install core libraries: `pnpm add react-router-dom@7 @tanstack/react-query@5 @tanstack/react-query-devtools zustand@5 axios react-hook-form @hookform/resolvers zod lucide-react sonner recharts date-fns`
- [x] Configure `vite.config.ts` path alias: `"@" → "./src"`
- [x] Configure `tsconfig.json` `paths` to match Vite alias
- [x] Set up `components.json` for Shadcn (auto-generated by CLI, verify paths)
- [x] Create `src/lib/utils.ts` with `cn()` (clsx + tailwind-merge) and helpers `formatCurrency`, `formatDate`, `formatRelativeDate`
- [x] Install testing tools: `pnpm add -D vitest @testing-library/react@16 @testing-library/user-event @testing-library/jest-dom msw happy-dom @vitest/coverage-v8`
- [x] Configure `vitest.config.ts`: environment `happy-dom`, globals `true`, setup file `src/test/setup.ts`, include `src/**/*.test.tsx`
- [x] Create `src/test/setup.ts`: `import '@testing-library/jest-dom'`; MSW server lifecycle in `beforeAll` / `afterEach` / `afterAll`
- [x] Create `src/test/mocks/server.ts`: `setupServer(...handlers)` exported for test use
- [x] Create `src/test/mocks/handlers.ts`: MSW `http` handlers for every API route returning realistic fixture data
- [x] Create `src/test/utils.tsx`: `renderWithProviders(ui, opts)` — wraps with fresh `QueryClient`, `MemoryRouter`, and pre-hydrated Zustand auth store; accepts `{ user?, permissions? }` override
- [x] Add scripts to `package.json`: `"test": "vitest"`, `"test:ui": "vitest --ui"`, `"test:coverage": "vitest run --coverage"`

### Phase 1 Tests

- [x] `cn()` merges class strings and deduplicates conflicting Tailwind classes
- [x] `formatCurrency(79.99)` returns `"$79.99"`; `formatDate(isoString)` returns a non-empty localized string
- [x] App mounts without throwing (`renderWithProviders(<App />)` smoke test)

## Phase 2 — TypeScript Types

- [x] `api.types.ts`: `PaginatedResponse<T>`, `PaginationMeta`, `ApiError`
- [x] `auth.types.ts`: `AuthUser { id, email, roles, permissions }`, `LoginCredentials`, `LoginResponse`
- [x] `user.types.ts`: `UserSafe`, `CreateUserPayload`, `UpdateUserPayload`
- [x] `role.types.ts`: `Role`, `Permission`, `CreateRolePayload`, `AssignRolePayload`
- [x] `product.types.ts`: `Product`, `ProductImage`, `CreateProductPayload`, `ProductQuery`, `UpdateStockPayload`
- [x] `category.types.ts`: `Category`, `CreateCategoryPayload`
- [x] `order.types.ts`: `Order`, `OrderItem`, `OrderStatus` enum, `OrderStats`, `UpdateOrderStatusPayload`
- [x] `coupon.types.ts`: `Coupon`, `DiscountType` enum, `CreateCouponPayload`
- [x] `review.types.ts`: `Review`, `ReviewQuery`

### Phase 2 Tests

- [x] All type files pass `tsc --noEmit` without errors
- [x] `OrderStatus` enum contains all 7 values (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`)
- [x] `PaginatedResponse<UserSafe>` correctly narrows `data` to `UserSafe[]` and `meta` to `PaginationMeta`

## Phase 3 — API Layer

- [x] `api/client.ts`: Axios instance with `baseURL = import.meta.env.VITE_API_URL`, `withCredentials: true` (needed for cookie-based refresh token), default `Content-Type: application/json`
- [x] Request interceptor: attach `Authorization: Bearer <token>` from Zustand store
- [x] Response interceptor: on `401`, call `POST /auth/refresh` once (with `withCredentials: true`), update store with new token, retry original request; on second 401, clear store and redirect to `/login`
- [x] `auth.api.ts`: `login()`, `logout()`, `refreshToken()`, `getMe()`
- [x] `users.api.ts`: `getUsers(query)`, `getUserById(id)`, `createUser(dto)`, `updateUser(id, dto)`, `softDeleteUser(id)`, `restoreUser(id)`
- [x] `roles.api.ts`: `getRoles()`, `getPermissions()`, `createRole(dto)`, `updateRole(id, dto)`, `deleteRole(id)`, `assignRole(dto)`, `revokeRole(dto)`
- [x] `products.api.ts`: `getProductsAdmin(query)`, `getProductById(id)`, `createProduct(dto)`, `updateProduct(id, dto)`, `updateStock(id, dto)`, `softDeleteProduct(id)`, `restoreProduct(id)`, `addProductImages(id, dto)`, `reorderImages(id, dto)`, `removeImage(imageId)`
- [x] `categories.api.ts`: `getCategoriesAdmin()`, `createCategory(dto)`, `updateCategory(id, dto)`, `deleteCategory(id, force?)`
- [x] `orders.api.ts`: `getOrdersAdmin(query)`, `getOrderStats()`, `getOrderById(id)`, `updateOrderStatus(id, dto)`
- [x] `coupons.api.ts`: `getCoupons(query)`, `getCouponById(id)`, `createCoupon(dto)`, `updateCoupon(id, dto)`, `deleteCoupon(id)`
- [x] `reviews.api.ts`: `getPendingReviews(query)`, `approveReview(id)`, `rejectReview(id)`, `adminDeleteReview(id)`
- [x] `files.api.ts`: `uploadFile(file: File)`, `uploadFiles(files: File[])` — uses `multipart/form-data`

### Phase 3 Tests

- [x] Request interceptor attaches `Authorization: Bearer <token>` header when a token exists in the store
- [x] Response interceptor calls `POST /auth/refresh` on 401, updates store with new token, and retries; on a second 401 it clears auth and navigates to `/login`
- [x] `login({ email, password })` sends `POST /auth/login` and returns `{ user, accessToken }`
- [x] `getUsers({ page: 1, limit: 20 })` serializes to `GET /users?page=1&limit=20`
- [x] `createUser(dto)` posts the full DTO body to `POST /users`
- [x] `updateOrderStatus(id, dto)` calls `PATCH /orders/:id/status` with correct body
- [x] All API functions surface a structured error object on non-2xx responses (4xx / 5xx)

## Phase 4 — State Management (Zustand)

- [x] `stores/auth.store.ts`: state `{ user: AuthUser | null, accessToken: string | null, isHydrated: boolean }`, actions `setTokens`, `setUser`, `clearAuth`, `hasPermission(perm: string): boolean`
- [x] `hasPermission` checks `manage:all` first (SUPER_ADMIN bypass), then checks the exact string
- [x] `isAdminUser` selector: returns true if user has any non-customer permission
- [x] On app boot (`App.tsx`): if `accessToken` exists in store, call `GET /auth/me`, set user; on failure call `POST /auth/refresh`, retry `GET /auth/me`; set `isHydrated = true` regardless
- [x] Use Zustand `persist` middleware with `localStorage` for `accessToken` only (never store sensitive data)

### Phase 4 Tests

- [x] `hasPermission('manage:all')` returns `true` for a SUPER_ADMIN user regardless of other checks
- [x] `hasPermission('read:user')` returns `true` when `'read:user'` is in `permissions` array
- [x] `hasPermission('create:user')` returns `false` when user only holds customer-level permissions
- [x] `isAdminUser` returns `false` for CUSTOMER-only permission set; `true` for any admin permission
- [x] `clearAuth()` resets `user` and `accessToken` to `null`
- [x] `persist` middleware writes only `accessToken` key to `localStorage`, never the full user object

## Phase 5 — React Query Setup & Hooks

- [x] Wrap app with `QueryClientProvider` (staleTime: 30s for lists, 60s for detail, 0 for mutations)
- [x] Configure global error handling: on 401 response, trigger auth refresh flow
- [x] `hooks/use-auth.ts`: `useLogin()`, `useLogout()`, `useGetMe()`
- [x] `hooks/use-users.ts`: `useUsers(query)`, `useUser(id)`, `useCreateUser()`, `useUpdateUser()`, `useDeleteUser()`, `useRestoreUser()`
- [x] `hooks/use-roles.ts`: `useRoles()`, `useRole(id)`, `usePermissions()`, `useCreateRole()`, `useUpdateRole()`, `useDeleteRole()`, `useAssignRole()`, `useRevokeRole()`
- [x] `hooks/use-products.ts`: `useProductsAdmin(query)`, `useProductAdmin(id)`, `useCreateProduct()`, `useUpdateProduct()`, `useDeleteProduct()`, `useRestoreProduct()`, `useUpdateStock()`, `useAddImages()`, `useReorderImages()`, `useRemoveImage()`
- [x] `hooks/use-categories.ts`: `useCategoriesAdmin()`, `useCreateCategory()`, `useUpdateCategory()`, `useDeleteCategory()`
- [x] `hooks/use-orders.ts`: `useOrdersAdmin(query)`, `useOrderStats()`, `useOrder(id)`, `useUpdateOrderStatus()`
- [x] `hooks/use-coupons.ts`: `useCoupons(query)`, `useCoupon(id)`, `useCreateCoupon()`, `useUpdateCoupon()`, `useDeleteCoupon()`
- [x] `hooks/use-reviews.ts`: `usePendingReviews(query)`, `useApproveReview()`, `useRejectReview()`, `useAdminDeleteReview()`
- [x] `hooks/use-files.ts`: `useUploadFile()`, `useUploadFiles()` — returns `{ upload, progress, url }`
- [x] Query key conventions: `['users', query]`, `['users', id]`, `['products', 'admin', query]`, etc.
- [x] Invalidate related query keys on mutation success

### Phase 5 Tests

- [x] `useUsers({ page: 1 })` returns typed `PaginatedResponse<UserSafe>` from MSW handler
- [x] `useCreateUser()` mutation invalidates the `['users']` query key on success
- [x] `useLogin()` mutation writes `accessToken` to Zustand store and calls `setUser`
- [x] `usePermissions()` returns `Permission[]` from MSW `GET /permissions` handler
- [x] A query backed by an MSW 500 response sets `isError=true` without crashing the render tree

## Phase 6 — Router & Guards

- [ ] `router/routes.config.ts`: array of `{ path, element, requiredPermission? }` — sidebar config also lives here (label, icon, requiredPermission)
- [ ] `router/AuthGuard.tsx`: reads `isHydrated` from store; shows skeleton while hydrating; redirects to `/login` if no user; redirects to `/forbidden` if `isAdminUser` is false
- [ ] `router/PermissionGuard.tsx`: wraps individual pages; accepts `permission: string`; redirects to `/forbidden` if user lacks it
- [ ] `router/index.tsx`: `createBrowserRouter` with nested routes under `AppLayout` wrapped in `AuthGuard`; `/login` is standalone (no auth required)
- [ ] Routes: `/login`, `/` (dashboard), `/users`, `/users/:id`, `/roles`, `/roles/:id`, `/products`, `/products/new`, `/products/:id`, `/categories`, `/orders`, `/orders/:id`, `/coupons`, `/reviews`, `/forbidden`, `*` (404)

### Phase 6 Tests

- [ ] `AuthGuard` redirects to `/login` when `isHydrated=true` and `user=null`
- [ ] `AuthGuard` renders a skeleton while `isHydrated=false`
- [ ] `AuthGuard` redirects to `/forbidden` when authenticated user has only CUSTOMER permissions (`isAdminUser=false`)
- [ ] `PermissionGuard` (route) redirects to `/forbidden` when user lacks the required permission
- [ ] `PermissionGuard` (route) renders `<Outlet>` when user holds the required permission
- [ ] Visiting `/login` while already authenticated immediately redirects to `/`

## Phase 7 — Layout & Shared Components

- [ ] `AppLayout.tsx`: flex container — collapsible Sidebar (desktop) + Sheet drawer (mobile) + main content area with Header
- [ ] `Sidebar.tsx`: logo, nav items filtered by `hasPermission`, active route highlight, collapse toggle
- [ ] `SidebarItem.tsx`: icon + label + optional badge; renders only if `hasPermission(requiredPermission)`
- [ ] `Header.tsx`: breadcrumb, user avatar dropdown (Profile, Change Password, Logout)
- [ ] `DataTable.tsx` (reusable): accepts `columns[]`, `data[]`, `isLoading`, renders Shadcn Table with column sorting header; skeleton rows on loading
- [ ] `PageHeader.tsx`: title + description + optional action button slot
- [ ] `ConfirmDialog.tsx`: Shadcn AlertDialog wrapper; accepts `title`, `description`, `onConfirm`, `isLoading`; used for all destructive actions
- [ ] `StatusBadge.tsx`: maps `OrderStatus` or `isActive` to colored Badge variant
- [ ] `PaginationBar.tsx`: prev/next + page number buttons; driven by `PaginationMeta`
- [ ] `ImageUpload.tsx`: drag-and-drop zone using native APIs; calls `useUploadFile`; preview thumbnails; remove button per image; supports multiple
- [ ] `EmptyState.tsx`: centered icon + message + optional CTA for empty list states
- [ ] `PermissionGuard.tsx` (shared): `<PermissionGuard permission="create:user"><button>...</button></PermissionGuard>` — renders children only if permitted; used for conditional UI elements (not routes)

### Phase 7 Tests

- [ ] `PermissionGuard` (shared) renders `children` when `hasPermission` is true; renders nothing when false
- [ ] `DataTable` renders the correct number of `<tr>` rows matching the `data` prop length
- [ ] `DataTable` renders Shadcn `Skeleton` rows when `isLoading=true`
- [ ] `ConfirmDialog` calls `onConfirm` on confirm click; keeps dialog open while `isLoading=true`
- [ ] `StatusBadge` with `status="DELIVERED"` uses a green variant; `CANCELLED` uses a red variant
- [ ] `PaginationBar` disables the Previous button on page 1 and Next button on the last page; fires `onPageChange` with the correct page number
- [ ] `EmptyState` renders the provided `message` prop text

## Phase 8 — Login Page

- [ ] Centered card layout (no sidebar)
- [ ] React Hook Form + Zod schema: `{ email: z.string().email(), password: z.string().min(8) }`
- [ ] On submit: call `useLogin()`, on success set store + navigate to `/`
- [ ] Show field-level validation errors inline
- [ ] Show toast on API error (invalid credentials)
- [ ] Redirect to `/` if already authenticated (check on mount)

### Phase 8 Tests

- [ ] Form shows inline validation error for a non-email value in the email field
- [ ] Form shows validation error for a password shorter than 8 characters
- [ ] Successful login: MSW returns `{ user, accessToken }`, Zustand store is updated, user is redirected to `/`
- [ ] Failed login (MSW returns 401): Sonner error toast is displayed; user remains on `/login`
- [ ] Already-authenticated user visiting `/login` is immediately redirected to `/`

## Phase 9 — Dashboard Home

- [ ] Stats row: 4 cards (Total Orders, Total Revenue, Avg Order Value, Orders by Status counts) — data from `GET /orders/admin/stats`
- [ ] Recent Orders table (last 10 orders with order number, customer, total, status, date)
- [ ] Orders by Status bar chart using Recharts `BarChart`
- [ ] Revenue trend section (placeholder if no time-series endpoint exists)
- [ ] Each card wrapped in `<PermissionGuard permission="read:analytics">` — page redirects via `PermissionGuard` route wrapper

### Phase 9 Tests

- [ ] Stats cards render correct values from MSW-mocked `GET /orders/admin/stats` response
- [ ] Recharts `BarChart` renders bars for each key in `ordersByStatus`
- [ ] Recent Orders table renders rows with correct `orderNumber` and `status` from `recentOrders`
- [ ] User with only CUSTOMER permissions is redirected to `/forbidden` when navigating to `/`

## Phase 10 — Users Management

### Users List (`read:user`)

- [ ] `DataTable` with columns: avatar, name, email, roles badges, status badge, created date, actions
- [ ] Server-side pagination via `PaginationBar` + `useUsers(query)` React Query hook
- [ ] `<PermissionGuard permission="create:user">` wraps "New User" button
- [ ] Row actions: Edit (`update:user`), Delete (`delete:user`), Restore (`update:user` on soft-deleted)

### Create / Edit User (`create:user` / `update:user`)

- [ ] Sheet/Dialog form with Zod validation
- [ ] Fields: email, firstName, lastName, phone, password (create only), isActive toggle, roleId select (populated from `useRoles()`)
- [ ] On create: `POST /users` body `{ email, password, firstName, lastName, phone?, roleId?, isActive? }`
- [ ] On edit: `PATCH /users/:id` body (all optional except at least one field)
- [ ] Invalidate `['users']` query on success, show Sonner toast

### User Detail (`read:user`)

- [ ] Display all user fields, roles list, account status
- [ ] Assign Role section: select dropdown + `POST /roles/assign` body `{ userId, roleId }` — requires `update:user`
- [ ] Revoke Role: `POST /roles/revoke` body `{ userId, roleId }` — requires `update:user`
- [ ] Cannot revoke last role (backend enforces; show error toast)

### Phase 10 Tests

- [ ] Users table renders `firstName`, `email`, and roles badges from MSW `GET /users` fixture
- [ ] "New User" button is absent in the DOM when user lacks `create:user`
- [ ] Create user form submits `POST /users` with correct body; `['users']` query invalidated; success toast shown
- [ ] Delete row action opens `ConfirmDialog`; confirming fires `DELETE /users/:id`
- [ ] Assign role form submits `POST /roles/assign` with `{ userId, roleId }`; user detail refreshes
- [ ] MSW returning 400 on revoke-last-role shows an error toast and keeps existing roles intact

## Phase 11 — Roles & Permissions

### Roles List

- [ ] Cards grid: role name, description, permission count badge
- [ ] "New Role" button guarded by `create:role`
- [ ] Delete button guarded by `delete:role`; disabled for built-in roles (SUPER_ADMIN, ADMIN, CUSTOMER)

### Create / Edit Role

- [ ] Name + description fields (Zod: name min 2, max 50)
- [ ] Permissions checklist: grouped by subject (product, category, order, user, role, review, coupon, analytics); populated from `GET /permissions`
- [ ] On create: `POST /roles` body `{ name, description?, permissionIds: string[] }`
- [ ] On edit: `PATCH /roles/:id` body `{ name?, description?, permissionIds: string[] }` — full replace of permissions array
- [ ] Invalidate `['roles']` on success

### Permissions reference table

- [ ] Read-only table of all permissions grouped by subject, shown below roles list
- [ ] Data from `GET /permissions` response: `[{ id, action, subject, description }]`

### Phase 11 Tests

- [ ] Roles list renders a card for each role with name and permission count badge
- [ ] Delete button is disabled (or absent) for `SUPER_ADMIN`, `ADMIN`, and `CUSTOMER` role names
- [ ] Permission checklist groups checkboxes by `subject` using data from MSW `GET /permissions`
- [ ] Create role form submits `POST /roles` with `name`, `description`, and `permissionIds` array
- [ ] Edit role form pre-checks existing permission IDs; submitting fires `PATCH /roles/:id` with full updated `permissionIds`

## Phase 12 — Products Management

### Products List (`read:product`)

- [ ] `DataTable` columns: image thumbnail, name, SKU, category, price, stock (with low-stock warning badge), status, featured badge, actions
- [ ] Filter toolbar: search (name/SKU), category select, isActive toggle, isFeatured toggle, price range inputs
- [ ] Query params: `GET /products/admin/all?search&categoryId&isActive&isFeatured&minPrice&maxPrice&page&limit&sortBy&sortOrder`
- [ ] "New Product" button — `create:product`
- [ ] Row actions: Edit, Delete (soft), Restore (if deleted) — with `PermissionGuard`

### Create / Edit Product

- [ ] Multi-section form (General, Pricing, Inventory, Images)
- [ ] **General**: name (min 2, max 200), description (textarea), shortDescription (max 500), categoryId (select from `useCategoriesAdmin()`), isActive switch, isFeatured switch
- [ ] **Pricing**: price (min 0.01), compareAtPrice (optional), costPrice (optional)
- [ ] **Inventory**: sku (min 2, max 100, unique), stock (int, min 0), lowStockThreshold (int, min 0), weight (optional decimal)
- [ ] **Images**: `ImageUpload` component; on file select call `POST /files/upload-multiple`; gets back URLs; on form submit include URLs in `POST /products/:id/images` body `{ images: [{url, alt?, sortOrder?}] }`
- [ ] On create: `POST /products` body as described; on success redirect to edit page
- [ ] On edit: `PATCH /products/:id`; image reorder via drag-and-drop (call `PATCH /products/:id/images/reorder` body `{ imageIds: string[] }`); remove image via `DELETE /products/images/:imageId`

### Stock Management

- [ ] Inline stock editor in list (click to open popover with quantity input + operation select)
- [ ] `PATCH /products/:id/stock` body `{ quantity: number, operation: 'set'|'increment'|'decrement' }`

### Phase 12 Tests

- [ ] Products list renders rows from MSW `GET /products/admin/all` fixture
- [ ] Low-stock warning badge appears when `stock < lowStockThreshold`
- [ ] Search input is debounced — rapid typing results in only one API call after 300 ms
- [ ] Product form blocks submission when `name`, `price`, or `sku` is empty
- [ ] File upload calls `POST /files/upload-multiple`; returned URL appears in the image preview list
- [ ] Image reorder fires `PATCH /products/:id/images/reorder` with the updated `imageIds` array

## Phase 13 — Categories Management

- [ ] List with tree indication (parent → children indented)
- [ ] Columns: image, name, slug, parent, product count, status, sort order, actions
- [ ] Create/edit in Sheet: name, description, parentId select (from same list, excluding self), image URL or upload, sortOrder, isActive
- [ ] `POST /categories` body `{ name, description?, parentId?, image?, sortOrder?, isActive? }`
- [ ] `DELETE /categories/:id` — warn if category has products; `?force=true` to force delete (backend cascades)

### Phase 13 Tests

- [ ] Category list indents child categories under their parent
- [ ] `parentId` select excludes the category currently being edited
- [ ] Create category form submits `POST /categories` with correct body
- [ ] Force-delete dialog appends `?force=true` to the `DELETE` request when the user confirms

## Phase 14 — Orders Management

### Orders List

- [ ] Filter toolbar: status select (`PENDING|CONFIRMED|PROCESSING|SHIPPED|DELIVERED|CANCELLED|REFUNDED`), date range pickers (dateFrom, dateTo)
- [ ] Query: `GET /orders/admin?status&dateFrom&dateTo&page&limit`
- [ ] Columns: order number, customer name/email, total amount, status badge, payment status badge, created date, actions

### Order Detail

- [ ] Order header: number, dates, status badge
- [ ] Customer info card
- [ ] Items table: product name, SKU, qty, unit price, total
- [ ] Shipping/Billing address snapshots
- [ ] Payment status card (Stripe payment intent status)
- [ ] Coupon applied (if any)
- [ ] Status update select + confirm button — `PATCH /orders/:id/status` body `{ status: OrderStatus }`; only valid transitions shown (PENDING→CONFIRMED→PROCESSING→SHIPPED→DELIVERED, any→CANCELLED where applicable)
- [ ] Transition map rendered as disabled options for invalid states

### Phase 14 Tests

- [ ] Selecting `status=SHIPPED` in the filter toolbar updates the `GET /orders/admin` query param
- [ ] Date range pickers pass ISO `dateFrom` / `dateTo` strings to the API request
- [ ] Order detail page renders the items table, shipping address snapshot, and payment status card
- [ ] Status update select shows only the valid next statuses for the current order status
- [ ] Options for invalid transitions are rendered as `disabled` select options

## Phase 15 — Coupons Management

- [ ] List columns: code, discount type badge, discount value, min order, max uses / used, active status, validity dates, actions
- [ ] Create/edit Sheet form with Zod validation
- [ ] Fields: code (uppercase, max 50), discountType (PERCENTAGE | FIXED_AMOUNT radio), discountValue (decimal string), minOrderAmount, maxDiscountAmount, maxUses, isActive switch, startsAt DatePicker, expiresAt DatePicker
- [ ] `POST /coupons` body `{ code, discountType, discountValue, description?, minOrderAmount?, maxDiscountAmount?, maxUses?, isActive?, startsAt?, expiresAt? }`
- [ ] Delete only if `currentUses === 0` (backend enforces; surface error toast)

### Phase 15 Tests

- [ ] Coupon form validates that `discountValue` is a non-empty decimal string
- [ ] Selecting `PERCENTAGE` type reveals the `maxDiscountAmount` field; `FIXED_AMOUNT` hides it
- [ ] `expiresAt` calendar disables dates earlier than the selected `startsAt` value
- [ ] Submitting the create form posts `POST /coupons` with correct decimal string values
- [ ] MSW returning 400 on delete (coupon in use) shows an error toast and keeps the row

## Phase 16 — Reviews Moderation

- [ ] Shows pending reviews (`GET /reviews/pending`)
- [ ] Columns: product name, reviewer (email), rating stars, title, comment excerpt, created date, actions
- [ ] Approve: `PATCH /reviews/:id/approve` — requires `update:review`
- [ ] Reject: `PATCH /reviews/:id/reject` — requires `update:review`
- [ ] Delete: `DELETE /reviews/admin/:id` — requires `delete:review`
- [ ] Optimistic updates: immediately remove row on action, revert on error

### Phase 16 Tests

- [ ] Pending reviews table renders rows from MSW `GET /reviews/pending` fixture
- [ ] Approving a review optimistically removes its row; MSW 500 response causes the row to reappear
- [ ] Rejecting a review optimistically removes its row; MSW 500 response causes the row to reappear
- [ ] Admin delete fires `ConfirmDialog`, then calls `DELETE /reviews/admin/:id` on confirmation

## Phase 17 — Reusable Component Patterns

- [ ] All list pages follow: `PageHeader` + filter toolbar + `DataTable` + `PaginationBar`
- [ ] All create/edit flows use a Sheet (slide-over) for simple forms, full page for complex forms (product)
- [ ] All destructive actions go through `ConfirmDialog` before firing mutation
- [ ] All mutations show `sonner` toast on success and error
- [ ] All guarded UI elements (buttons, rows, sections) use `<PermissionGuard permission="...">` to hide (not just disable)
- [ ] Loading states: `DataTable` shows skeleton rows; forms disable submit button; use `isPending` from React Query mutations
- [ ] Error boundaries on each page route for unexpected errors

## Phase 18 — Polish & Performance

- [ ] Route-level code splitting: `React.lazy` + `Suspense` for all page components
- [ ] TailwindCSS v4 `@layer` organization in `index.css` for base, components, utilities
- [ ] Optimistic updates for review approve/reject and order status change
- [ ] `useDebounce` hook for search inputs (300ms) to avoid excessive API calls
- [ ] Table column visibility toggle (Shadcn `DropdownMenu` for column show/hide)
- [ ] Accessible: all interactive elements have aria labels; modals trap focus
- [ ] Responsive: sidebar collapses to Sheet on mobile (< 768px)
- [ ] Add `.env.example` with `VITE_API_URL=http://localhost:3000/api/v1`

## Notes & Gotchas

- **Package manager**: All commands use `pnpm`. Runtime deps: `pnpm add <pkg>`. Dev deps: `pnpm add -D <pkg>`. CLI tools: `pnpm dlx <cmd>` (replaces `npx`). Scripts in `package.json` are run with `pnpm <script>` as usual.
- **TailwindCSS v4**: no `tailwind.config.ts`; configure theme via `@theme {}` in CSS. The `@tailwindcss/vite` plugin auto-detects content files. Shadcn UI `pnpm dlx shadcn@latest init` handles v4 automatically.
- **Shadcn + v4**: CSS vars for colors are set with `@theme inline` — do not manually add them; let `shadcn init` generate them.
- **Cookie-based refresh**: `axios` instance must have `withCredentials: true` globally so the browser sends the `refreshToken` cookie to `/auth/refresh`.
- **Permissions in JWT**: roles and permissions are embedded in the access token payload. After login, call `GET /auth/me` to get the live permission list (in case they changed server-side).
- **SUPER_ADMIN**: has `manage:all` permission which must be checked first before any specific permission check.
- **Built-in roles** (SUPER_ADMIN, ADMIN, CUSTOMER) cannot be deleted — backend returns `403`; disable delete button for these in the UI by checking `['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'].includes(role.name)`.
- **Decimal prices**: backend returns `Decimal` as string (e.g. `"79.99"`); always use `Number(value)` or `parseFloat(value)` when displaying, never direct arithmetic on the string.
- **Soft delete**: users and products are soft-deleted (`deletedAt` field). Admin lists exclude deleted by default; add a "show deleted" toggle if needed.
