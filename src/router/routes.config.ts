import { lazy } from "react";
import {
  LayoutDashboard,
  Users,
  Shield,
  Package,
  Tags,
  ShoppingCart,
  Ticket,
  Star,
} from "lucide-react";

// Pages
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const UsersPage = lazy(() => import("@/pages/users/UsersPage"));
const UserDetailPage = lazy(() => import("@/pages/users/UserDetailPage"));
const RolesPage = lazy(() => import("@/pages/roles/RolesPage"));
const RoleDetailPage = lazy(() => import("@/pages/roles/RoleDetailPage"));
const ProductsPage = lazy(() => import("@/pages/products/ProductsPage"));
const ProductFormPage = lazy(() => import("@/pages/products/ProductFormPage"));
const CategoriesPage = lazy(() => import("@/pages/categories/CategoriesPage"));
const OrdersPage = lazy(() => import("@/pages/orders/OrdersPage"));
const OrderDetailPage = lazy(() => import("@/pages/orders/OrderDetailPage"));
const CouponsPage = lazy(() => import("@/pages/coupons/CouponsPage"));
const ReviewsPage = lazy(() => import("@/pages/reviews/ReviewsPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ForbiddenPage = lazy(() => import("@/pages/errors/ForbiddenPage"));
const NotFoundPage = lazy(() => import("@/pages/errors/NotFoundPage"));

export type RouteConfig = {
  path: string;
  label?: string;
  icon?: React.ElementType;
  element: React.FC;
  requiredPermission?: string;
  hideInSidebar?: boolean;
};

export const appRoutes: RouteConfig[] = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    element: DashboardPage,
    requiredPermission: "read:analytics",
  },
  {
    path: "/users",
    label: "Users",
    icon: Users,
    element: UsersPage,
    requiredPermission: "read:user",
  },
  {
    path: "/users/:id",
    element: UserDetailPage,
    requiredPermission: "read:user",
    hideInSidebar: true,
  },
  {
    path: "/roles",
    label: "Roles & Permissions",
    icon: Shield,
    element: RolesPage,
    requiredPermission: "read:role",
  },
  {
    path: "/roles/:id",
    element: RoleDetailPage,
    requiredPermission: "read:role",
    hideInSidebar: true,
  },
  {
    path: "/products",
    label: "Products",
    icon: Package,
    element: ProductsPage,
    requiredPermission: "read:product",
  },
  {
    path: "/products/new",
    element: ProductFormPage,
    requiredPermission: "create:product",
    hideInSidebar: true,
  },
  {
    path: "/products/:id",
    element: ProductFormPage,
    requiredPermission: "read:product",
    hideInSidebar: true,
  },
  {
    path: "/categories",
    label: "Categories",
    icon: Tags,
    element: CategoriesPage,
    requiredPermission: "read:category",
  },
  {
    path: "/orders",
    label: "Orders",
    icon: ShoppingCart,
    element: OrdersPage,
    requiredPermission: "read:order",
  },
  {
    path: "/orders/:id",
    element: OrderDetailPage,
    requiredPermission: "read:order",
    hideInSidebar: true,
  },
  {
    path: "/coupons",
    label: "Coupons",
    icon: Ticket,
    element: CouponsPage,
    requiredPermission: "read:coupon",
  },
  {
    path: "/reviews",
    label: "Reviews",
    icon: Star,
    element: ReviewsPage,
    requiredPermission: "read:review",
  },
];

export const publicRoutes = [
  { path: "/login", element: LoginPage },
  { path: "/forbidden", element: ForbiddenPage },
];

export const notFoundRoute = { path: "*", element: NotFoundPage };
