# E-commerce Dashboard UI/UX Plan

This document provides a detailed layout and data plan for the E-commerce Dashboard project to guide UI/UX design and implementation.

---

## 1. Global Layout Structure (`AppLayout`)

- **Sidebar (Left):**
    - Collapsible navigation.
    - Icons: `LayoutDashboard`, `Users`, `Shield`, `Package`, `Tags`, `ShoppingCart`, `Ticket`, `Star`.
    - Items: Dashboard, Users, Roles & Permissions, Products, Categories, Orders, Coupons, Reviews.
- **Header (Top):**
    - Breadcrumbs for navigation context.
    - Search bar (global).
    - User Profile dropdown (Avatar, Email, Logout).
    - Theme Toggle (if applicable).
- **Main Content Area:**
    - Responsive grid/flex container.
    - Padding: `p-4 sm:px-6 sm:py-0`.
    - Max-width for large screens: `1400px`.

---

## 2. Page-by-Page Breakdown

### 2.1 Dashboard (`/`)
*Overview of store performance.*

- **Layout:** 4-column metric grid + 2-column detail grid (4:3 ratio).
- **Data (Metrics):**
    - **Total Orders:** Count (Icon: `ShoppingCart`).
    - **Total Revenue:** Currency formatted (Icon: `DollarSign`).
    - **Avg Order Value:** Currency formatted (Icon: `TrendingUp`).
    - **Delivered Orders:** Count (Icon: `Activity`) + Pending/Processing sub-stats.
- **Visuals:**
    - **Orders by Status:** Bar chart (Recharts) showing PENDING, PROCESSING, DELIVERED, etc.
    - **Recent Orders List:**
        - Fields: Order Number, Customer Name, Customer Email, Status Badge, Total Amount.
- **Interactions:** Permission-guarded access (`read:analytics`).

### 2.2 Users Management (`/users`)
*Manage administrative and customer accounts.*

- **Layout:** Page Header + Filter Toolbar + Data Table + Pagination + Slide-over Sheet (User Form).
- **Data Table Columns:**
    - **User:** Avatar + Full Name + Email.
    - **Roles:** List of badges (e.g., ADMIN, CUSTOMER).
    - **Status:** Badge (Active/Inactive).
    - **Joined:** Date (MMM d, yyyy).
    - **Actions:** Edit (Icon: `Edit`), Delete (Icon: `Trash2`), Restore (Icon: `RotateCcw`).
- **Filters:**
    - Search input (Name, Email, Role).
    - Status dropdown (All, Active, Inactive).
- **Form (Slide-over):**
    - Email, Password (with "leave blank to keep" for edit), First Name, Last Name, Phone, Role Dropdown, Active Toggle.

### 2.3 User Detail (`/users/:id`)
*Detailed profile and role management.*

- **Layout:** 2-column grid.
- **Column 1: Profile Card**
    - Big Avatar, Full Name, Email, Status Badge.
    - Info grid: Phone, Joined Date, Last Updated.
- **Column 2: Roles & Permissions Card**
    - Current Roles: List of badges with "X" to revoke.
    - Assign New Role: Dropdown + Assign Button.
- **Interactions:** Permission-guarded revoke/assign (`update:user`).

### 2.4 Roles & Permissions (`/roles`)
*RBAC management.*

- **Layout:** Page Header + Filter Toolbar + Card Grid + Permissions Reference Table.
- **Card Content (Role):**
    - Title (Role Name), Description, Permission Count Badge.
    - Scope Indicator (Built-in vs Custom).
    - Actions: Edit, Delete (disabled for built-in roles).
- **Form (Slide-over):**
    - Role Name, Description.
    - **Permissions Selection:** Grouped by subject (Product, Order, User, etc.) with Checkboxes.
- **Reference Table:** List of all system permissions with actions and subjects.

### 2.5 Products Management (`/products`)
*Inventory and catalog control.*

- **Layout:** Page Header + Advanced Filter Toolbar + Data Table + Pagination + Delete Dialog.
- **Data Table Columns:**
    - **Image:** Thumbnail (Icon: `ImageIcon` fallback).
    - **Name:** Product Name + Soft-delete indicator.
    - **SKU:** Text.
    - **Category:** Name.
    - **Price:** Currency formatted.
    - **Stock:** Current count + Low stock indicator (Badge: `AlertTriangle`).
    - **Status:** Badge (Active/Inactive).
    - **Featured:** Badge (Featured/No).
    - **Actions:** Edit, Delete, Restore.
- **Advanced Filters:**
    - Search (Name, SKU).
    - Category Select.
    - Status Select (Active, Inactive).
    - Type Select (Featured, Standard).
    - Price Range (Min/Max inputs).
    - Sort By (Newest, Name, Price, Stock).
- **Interactions:** Inline Stock Update (Popover with Set/Add/Remove operations).

### 2.6 Product Form (`/products/new` & `/products/:id`)
*Comprehensive product data entry.*

- **Layout:** Single column, max-width `5xl`, grouped by Cards.
- **Card 1: General**
    - Name, Category Select, Short Description (Input), Long Description (Textarea), Active Toggle, Featured Toggle.
- **Card 2: Pricing**
    - Price, Compare at Price, Cost Price.
- **Card 3: Inventory**
    - SKU, Weight, Stock Count, Low Stock Threshold.
- **Card 4: Images**
    - **Existing Images:** Grid with drag-to-reorder functionality, delete button.
    - **Uploader:** `ImageUpload` component (Drag & Drop, multiple).
- **Actions:** Cancel, Save/Create (with loading states).

### 2.7 Categories (`/categories`)
*Taxonomy management.*

- **Layout:** Page Header + Filter Toolbar + Data Table (Tree view) + Slide-over Sheet (Category Form).
- **Data Table Columns:**
    - **Image:** Thumbnail.
    - **Name:** Indented tree name (↳ Child).
    - **Slug:** Text.
    - **Parent:** Parent Name.
    - **Products:** Count.
    - **Status:** Badge.
    - **Sort Order:** Number.
    - **Actions:** Edit, Delete.
- **Form (Slide-over):**
    - Name, Description (Textarea), Parent Category (Dropdown with tree indentation), Image Upload, Sort Order, Active Toggle.

### 2.8 Orders Management (`/orders`)
*Sales and fulfillment tracking.*

- **Layout:** Page Header + Filter Toolbar + Data Table + Pagination.
- **Data Table Columns:**
    - **Order:** Order Number + Order ID.
    - **Customer:** Name + Email.
    - **Total:** Currency formatted.
    - **Status:** Status Badge (PENDING, PROCESSING, etc.).
    - **Payment:** Status Badge (PAID, UNPAID).
    - **Created:** Date.
    - **Actions:** View (Icon: `Eye`).
- **Filters:**
    - Status Select.
    - Date From/To Pickers.

### 2.9 Order Detail (`/orders/:id`)
*Order lifecycle and customer data.*

- **Layout:** 2-column layout (2:1 ratio).
- **Main Column:**
    - **Order Header Card:** Status milestones (Created, Shipped, Delivered).
    - **Items Table Card:** Image (optional), Name, SKU, Qty, Unit Price, Total.
    - **Address Grid:** Shipping vs Billing (Name, Line 1/2, City, State, ZIP, Country, Phone).
- **Side Column:**
    - **Customer Card:** Name, Email, User ID.
    - **Payment Card:** Provider, Transaction ID, Status Badge, Total Amount.
    - **Coupon Card:** Code, Type, Value, Applied Discount.
    - **Status Update Card:** Restricted status transitions (Dropdown + Confirm Button).
- **Interactions:** Status flow validation (e.g., PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED).

### 2.10 Coupons (`/coupons`)
*Marketing and discount management.*

- **Layout:** Page Header + Filter Toolbar + Data Table + Slide-over Sheet (Coupon Form).
- **Data Table Columns:**
    - **Code:** UPPERCASE text.
    - **Type:** Badge (Percentage, Fixed).
    - **Value:** Number/Currency.
    - **Min Order:** Currency.
    - **Usage:** Current / Max Uses.
    - **Status:** Badge.
    - **Validity:** Start Date + End Date.
- **Form (Slide-over):**
    - Code (Auto-uppercase), Active Toggle.
    - Discount Type Radio (Percentage, Fixed Amount).
    - Discount Value, Min Order Amount.
    - Max Discount Amount (Visible only if Percentage).
    - Max Uses, Description.
    - Date Pickers (Starts At, Expires At).

### 2.11 Reviews (`/reviews`)
*Customer feedback moderation.*

- **Layout:** Page Header + Filter Toolbar + Data Table.
- **Data Table Columns:**
    - **Product:** Name.
    - **Reviewer:** Email.
    - **Rating:** Star rating (1-5 visual stars).
    - **Title:** Text.
    - **Comment:** Excerpt (truncated).
    - **Created:** Date.
    - **Actions:** Approve (Icon: `Check`), Reject (Icon: `X`), Delete (Icon: `Trash2`).
- **Filters:**
    - Search (Product, Reviewer, Content).
    - Rating Range (All, 4+ Stars, 3 or Less).

### 2.12 Auth & Errors
- **Login Page:** Center card with Logo, Email, Password, Login Button.
- **403 Forbidden:** Illustration + Message + "Go Back" button.
- **404 Not Found:** Illustration + Message + "Back to Dashboard" button.

---

## 3. Design Tokens & Components

- **Typography:** Inter (Sans-serif).
- **Color Palette:**
    - Primary: Brand color (Dashboard buttons, active states).
    - Destructive: Red (Delete, Reject, Inactive).
    - Muted: Gray (Secondary text, background grids).
    - Success: Green (Delivered, Paid, Active).
- **Components:**
    - `DataTable`: Responsive with horizontal scroll for many columns.
    - `StatusBadge`: Consistent styling across different status types.
    - `FilterToolbar`: Multi-column responsive grid for search and selects.
    - `ConfirmDialog`: Standard overlay for destructive actions.
    - `PageHeader`: Title, description, and primary action button.
