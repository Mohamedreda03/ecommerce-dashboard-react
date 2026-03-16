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
      data: [{ id: 1, email: "admin@example.com" }],
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
  http.post("*/users", async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      id: 2,
      email: body.email || "new@example.com",
      firstName: body.firstName,
      lastName: body.lastName,
    });
  }),
  // Roles / Permissions
  http.get("*/permissions", () => {
    return HttpResponse.json([
      { id: 1, action: "manage", subject: "all" },
      { id: 2, action: "read", subject: "user" },
    ]);
  }),
];
