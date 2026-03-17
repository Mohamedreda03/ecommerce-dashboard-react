import { createBrowserRouter } from "react-router-dom";
import { Suspense } from "react";

import AppLayout from "@/components/layout/AppLayout";
import AuthGuard from "./AuthGuard";
import PermissionGuard from "./PermissionGuard";
import { appRoutes, publicRoutes, notFoundRoute } from "./routes.config";

const PageSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }
  >
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  // Public Routes (No Layout)
  ...publicRoutes.map((route) => ({
    path: route.path,
    element: (
      <PageSuspense>
        <route.element />
      </PageSuspense>
    ),
    errorElement: route.errorElement ? (
      <PageSuspense>
        <route.errorElement />
      </PageSuspense>
    ) : undefined,
  })),

  // Authenticated Routes (AppLayout + AuthGuard)
  {
    path: "/",
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: appRoutes.map((route) => {
          const PageComponent = route.element;

          // If a permission is required, wrap in PermissionGuard
          const element = route.requiredPermission ? (
            <PermissionGuard permission={route.requiredPermission}>
              <PageComponent />
            </PermissionGuard>
          ) : (
            <PageComponent />
          );

          return {
            path: route.path === "/" ? undefined : route.path,
            index: route.path === "/",
            element: <PageSuspense>{element}</PageSuspense>,
            errorElement: route.errorElement ? (
              <PageSuspense>
                <route.errorElement />
              </PageSuspense>
            ) : undefined,
          };
        }),
      },
    ],
  },

  // 404
  {
    path: notFoundRoute.path,
    element: (
      <PageSuspense>
        <notFoundRoute.element />
      </PageSuspense>
    ),
    errorElement: notFoundRoute.errorElement ? (
      <PageSuspense>
        <notFoundRoute.errorElement />
      </PageSuspense>
    ) : undefined,
  },
]);
