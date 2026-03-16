import { http, HttpResponse } from "msw";

export const handlers = [
  // Auth
  http.post("*/auth/login", () => {
    return HttpResponse.json({
      user: {
        id: 1,
        email: "admin@example.com",
        roles: ["SUPER_ADMIN"],
        permissions: ["manage:all"],
      },
      accessToken: "mock-access-token",
    });
  }),
  http.get("*/auth/me", () => {
    return HttpResponse.json({
      id: 1,
      email: "admin@example.com",
      roles: ["SUPER_ADMIN"],
      permissions: ["manage:all"],
    });
  }),
  // Users
  http.get("*/users", () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          email: "admin@example.com",
          firstName: "Admin",
          lastName: "User",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          roles: [{ role: { id: 1, name: "SUPER_ADMIN" } }],
        },
        {
          id: 2,
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
          isActive: false,
          createdAt: "2024-02-01T00:00:00.000Z",
          updatedAt: "2024-02-01T00:00:00.000Z",
          roles: [{ role: { id: 2, name: "CUSTOMER" } }],
        },
      ],
      meta: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }),
  http.get("*/users/:id", ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      isActive: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      roles: [{ role: { id: 1, name: "SUPER_ADMIN" } }],
    });
  }),
  http.post("*/users", async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      id: 3,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      roles: [],
    });
  }),
  http.patch("*/users/:id", async ({ params, request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      id: Number(params.id),
      ...body,
    });
  }),
  http.delete("*/users/:id", () => {
    return HttpResponse.json({ success: true });
  }),
  http.post("*/users/:id/restore", () => {
    return HttpResponse.json({ success: true });
  }),
  http.post("*/roles/assign", async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, roleId: body.roleId });
  }),
  http.post("*/roles/revoke", async ({ request }) => {
    const body = (await request.json()) as any;
    // Simulate failing if it's the last role
    if (body.roleId === 1) {
      // Assume roleId 1 is the "last role" in tests
      return HttpResponse.json(
        { message: "Cannot remove the last role" },
        { status: 400 },
      );
    }
    return HttpResponse.json({ success: true });
  }),
  http.get("*/roles", () => {
    return HttpResponse.json([
      { id: 1, name: "SUPER_ADMIN", description: "All power" },
      { id: 2, name: "CUSTOMER", description: "Default role" },
    ]);
  }),
  // Roles / Permissions
  http.get("*/permissions", () => {
    return HttpResponse.json([
      { id: 1, action: "manage", subject: "all" },
      { id: 2, action: "read", subject: "user" },
    ]);
  }),
  // Orders
  http.get("*/orders/admin/stats", () => {
    return HttpResponse.json({
      totalOrders: 150,
      totalRevenue: "12500.50",
      averageOrderValue: "83.33",
      ordersByStatus: {
        PENDING: 10,
        PROCESSING: 5,
        SHIPPED: 25,
        DELIVERED: 100,
        CANCELLED: 10,
      },
      recentOrders: [
        {
          id: 1,
          orderNumber: "ORD-001",
          status: "DELIVERED",
          totalAmount: "125.00",
          createdAt: "2024-03-10T10:00:00Z",
          user: {
            id: 1,
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
          },
        },
        {
          id: 2,
          orderNumber: "ORD-002",
          status: "SHIPPED",
          totalAmount: "45.00",
          createdAt: "2024-03-10T14:30:00Z",
          user: {
            id: 2,
            email: "jane@example.com",
            firstName: "Jane",
            lastName: "Smith",
          },
        },
      ],
    });
  }),
];
