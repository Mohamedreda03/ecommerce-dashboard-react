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
const RouteErrorPage = lazy(() => import("@/pages/errors/RouteErrorPage"));

export type RouteConfig = {
  path: string;
  label?: string;
  icon?: React.ElementType;
  element: React.FC;
  errorElement?: React.FC;
  requiredPermission?: string;
  hideInSidebar?: boolean;
};

export const appRoutes: RouteConfig[] = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    element: DashboardPage,
    errorElement: RouteErrorPage,
    requiredPermission: "read:analytics",
  },
  {
    path: "/users",
    label: "Users",
    icon: Users,
    element: UsersPage,
    errorElement: RouteErrorPage,
    requiredPermission: "read:user",
  },
  {
    path: "/users/:id",
    element: UserDetailPage,
    errorElement: RouteErrorPage,
    requiredPermission: "read:user",
    hideInSidebar: true,
  },
  {
    path: "/roles",
    label: "Roles & Permissions",
    icon: Shield,
    element: RolesPage,
    errorElement: RouteErrorPage,
    requiredPermission: "read:role",
  },
  {
    path: "/roles/:id",
    element: RoleDetailPage,
    errorElement: RouteErrorPage,
    requiredPermission: "read:role",
    hideInSidebar: true,
  },
  {
    path: "/products",
    label: "Products",
    icon: Package,
    element: ProductsPage,
    errorElement: RouteErrorPage,
    requiredPermission: "read:product",
  },
  {
    path: "/products/new",
    element: ProductFormPage,
    errorElement: RouteErrorPage,
    requiredPermission: "create:product",
    hideInSidebar: true,
  },
  {
    path: "/products/:id",
    element: ProductFormPage,
    errorElement: RouteErrorPage,
    requiredPermission: "read:product",
    hideInSidebar: true,
  },
  {
    path: "/categories",
    label: "Categories",
    icon: Tags,
    element: CategoriesPage,
    errorElement: RouteErrorPage,
    requiredPermission: "read:category",
  },
  {
    path: "/orders",
    label: "Orders",
    icon: ShoppingCart,
    element: OrdersPage,
    errorElement: RouteErrorPage,
    requiredPermission: "read:order",
  },
  {
    path: "/orders/:id",
    element: OrderDetailPage,
    errorElement: RouteErrorPage,
    requiredPermission: "read:order",
    hideInSidebar: true,
  },
  {
    path: "/coupons",
    label: "Coupons",
    icon: Ticket,
    element: CouponsPage,
    errorElement: RouteErrorPage,
    requiredPermission: "read:coupon",
  },
  {
    path: "/reviews",
    label: "Reviews",
    icon: Star,
    element: ReviewsPage,
    errorElement: RouteErrorPage,
    requiredPermission: "read:review",
  },
];

export const publicRoutes = [
  { path: "/login", element: LoginPage, errorElement: RouteErrorPage },
  { path: "/forbidden", element: ForbiddenPage, errorElement: RouteErrorPage },
];

export const notFoundRoute = { path: "*", element: NotFoundPage, errorElement: RouteErrorPage };
