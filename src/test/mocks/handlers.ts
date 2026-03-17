import { http, HttpResponse } from "msw";

const categoryFixtures = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    description: "Devices and accessories",
    parentId: null,
    image: "https://example.com/categories/electronics.jpg",
    sortOrder: 1,
    isActive: true,
    productCount: 2,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Headphones",
    slug: "headphones",
    description: "Audio accessories",
    parentId: 1,
    image: "https://example.com/categories/headphones.jpg",
    sortOrder: 2,
    isActive: true,
    productCount: 1,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
  {
    id: 3,
    name: "Apparel",
    slug: "apparel",
    description: "Clothing and fashion",
    parentId: null,
    image: "https://example.com/categories/apparel.jpg",
    sortOrder: 3,
    isActive: true,
    productCount: 1,
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z",
  },
];

const productFixtures = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: "199.99",
    sku: "WH-1000",
    description: "Noise-cancelling over-ear headphones",
    shortDescription: "Premium wireless headphones",
    compareAtPrice: "249.99",
    costPrice: "120.00",
    stock: 3,
    lowStockThreshold: 5,
    weight: "0.45",
    isActive: true,
    isFeatured: true,
    categoryId: 1,
    images: [
      { id: 101, url: "https://example.com/images/headphones-1.jpg", alt: "Wireless Headphones", sortOrder: 0 },
      { id: 102, url: "https://example.com/images/headphones-2.jpg", alt: "Wireless Headphones Side", sortOrder: 1 },
    ],
    deletedAt: null,
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Cotton Hoodie",
    price: "59.99",
    sku: "HD-2000",
    description: "Soft cotton hoodie",
    shortDescription: "Everyday hoodie",
    compareAtPrice: "",
    costPrice: "25.00",
    stock: 18,
    lowStockThreshold: 4,
    weight: "0.80",
    isActive: true,
    isFeatured: false,
    categoryId: 2,
    images: [],
    deletedAt: null,
    createdAt: "2024-02-15T00:00:00.000Z",
    updatedAt: "2024-02-15T00:00:00.000Z",
  },
  {
    id: 3,
    name: "Archived Speaker",
    price: "89.99",
    sku: "SP-3000",
    description: "Portable speaker",
    shortDescription: "Bluetooth speaker",
    compareAtPrice: "",
    costPrice: "45.00",
    stock: 0,
    lowStockThreshold: 2,
    weight: "1.20",
    isActive: false,
    isFeatured: false,
    categoryId: 1,
    images: [
      { id: 103, url: "https://example.com/images/speaker-1.jpg", alt: "Archived Speaker", sortOrder: 0 },
    ],
    deletedAt: "2024-03-01T00:00:00.000Z",
    createdAt: "2024-02-01T00:00:00.000Z",
    updatedAt: "2024-03-01T00:00:00.000Z",
  },
];

const orderFixtures = [
  {
    id: 1,
    orderNumber: "ORD-001",
    userId: 1,
    status: "PENDING",
    subtotalAmount: "110.00",
    shippingAmount: "10.00",
    taxAmount: "5.00",
    discountAmount: "15.00",
    totalAmount: "110.00",
    shippingAddressSnapshot: {
      firstName: "John",
      lastName: "Doe",
      addressLine1: "123 Market Street",
      addressLine2: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "US",
      phone: "+1 555-0101",
    },
    billingAddressSnapshot: {
      firstName: "John",
      lastName: "Doe",
      addressLine1: "123 Market Street",
      addressLine2: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "US",
      phone: "+1 555-0101",
    },
    couponId: 1,
    notes: "Leave package at the front desk.",
    shippedAt: null,
    deliveredAt: null,
    cancelledAt: null,
    createdAt: "2024-03-10T10:00:00.000Z",
    updatedAt: "2024-03-10T10:00:00.000Z",
    items: [
      {
        id: 11,
        productId: 1,
        productName: "Wireless Headphones",
        sku: "WH-1000",
        quantity: 1,
        unitPrice: "95.00",
        totalPrice: "95.00",
      },
      {
        id: 12,
        productId: 3,
        productName: "Travel Case",
        sku: "TC-3300",
        quantity: 1,
        unitPrice: "15.00",
        totalPrice: "15.00",
      },
    ],
    payment: {
      id: 1,
      status: "succeeded",
      provider: "stripe",
      transactionId: "pi_12345",
    },
    coupon: {
      id: 1,
      code: "SPRING15",
      discountType: "PERCENTAGE",
      discountValue: "15",
    },
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
    userId: 2,
    status: "SHIPPED",
    subtotalAmount: "45.00",
    shippingAmount: "0.00",
    taxAmount: "0.00",
    discountAmount: "0.00",
    totalAmount: "45.00",
    shippingAddressSnapshot: {
      firstName: "Jane",
      lastName: "Smith",
      addressLine1: "88 Broadway",
      addressLine2: "",
      city: "New York",
      state: "NY",
      postalCode: "10012",
      country: "US",
      phone: "+1 555-0202",
    },
    billingAddressSnapshot: {
      firstName: "Jane",
      lastName: "Smith",
      addressLine1: "88 Broadway",
      addressLine2: "",
      city: "New York",
      state: "NY",
      postalCode: "10012",
      country: "US",
      phone: "+1 555-0202",
    },
    couponId: null,
    notes: "",
    shippedAt: "2024-03-12T09:30:00.000Z",
    deliveredAt: null,
    cancelledAt: null,
    createdAt: "2024-03-10T14:30:00.000Z",
    updatedAt: "2024-03-12T09:30:00.000Z",
    items: [
      {
        id: 21,
        productId: 2,
        productName: "Cotton Hoodie",
        sku: "HD-2000",
        quantity: 1,
        unitPrice: "45.00",
        totalPrice: "45.00",
      },
    ],
    payment: {
      id: 2,
      status: "processing",
      provider: "stripe",
      transactionId: "pi_67890",
    },
    coupon: null,
    user: {
      id: 2,
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
    },
  },
];

const couponFixtures = [
  {
    id: 1,
    code: "SPRING15",
    discountType: "PERCENTAGE",
    discountValue: "15.00",
    description: "15% off spring collection",
    minOrderAmount: "50.00",
    maxDiscountAmount: "25.00",
    maxUses: 100,
    currentUses: 12,
    isActive: true,
    startsAt: "2024-03-01T00:00:00.000Z",
    expiresAt: "2024-03-31T00:00:00.000Z",
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },
  {
    id: 2,
    code: "WELCOME10",
    discountType: "FIXED_AMOUNT",
    discountValue: "10.00",
    description: "Welcome discount",
    minOrderAmount: "25.00",
    maxDiscountAmount: null,
    maxUses: 50,
    currentUses: 0,
    isActive: true,
    startsAt: "2024-01-01T00:00:00.000Z",
    expiresAt: "2024-12-31T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

const reviewFixtures = [
  {
    id: 1,
    productId: 1,
    userId: 1,
    rating: 5,
    title: "Excellent sound",
    comment: "The noise cancellation is excellent and the battery lasts all week.",
    status: "PENDING",
    createdAt: "2024-03-05T08:00:00.000Z",
    updatedAt: "2024-03-05T08:00:00.000Z",
    user: {
      id: 1,
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "Stone",
    },
    product: {
      id: 1,
      name: "Wireless Headphones",
    },
  },
  {
    id: 2,
    productId: 2,
    userId: 2,
    rating: 3,
    title: "Comfortable but warm",
    comment: "Nice material overall, but it feels a bit too warm indoors after an hour.",
    status: "PENDING",
    createdAt: "2024-03-06T09:15:00.000Z",
    updatedAt: "2024-03-06T09:15:00.000Z",
    user: {
      id: 2,
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Lee",
    },
    product: {
      id: 2,
      name: "Cotton Hoodie",
    },
  },
];

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
  // Roles assign / revoke (must be before wildcard roles handlers)
  http.post("*/roles/assign", async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, roleId: body.roleId });
  }),
  http.post("*/roles/revoke", async ({ request }) => {
    const body = (await request.json()) as any;
    // Simulate failing if it's the last role
    if (body.roleId === 1) {
      return HttpResponse.json(
        { message: "Cannot remove the last role" },
        { status: 400 },
      );
    }
    return HttpResponse.json({ success: true });
  }),
  // Roles CRUD
  http.get("*/roles", () => {
    return HttpResponse.json([
      {
        id: 1,
        name: "SUPER_ADMIN",
        description: "Full system access",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        permissions: [
          { permission: { id: 1, action: "manage", subject: "all", description: "Full access" } },
        ],
      },
      {
        id: 2,
        name: "ADMIN",
        description: "Administrative access",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        permissions: [
          { permission: { id: 2, action: "read", subject: "product", description: "View products" } },
          { permission: { id: 3, action: "create", subject: "product", description: "Create products" } },
          { permission: { id: 4, action: "read", subject: "user", description: "View users" } },
        ],
      },
      {
        id: 3,
        name: "CUSTOMER",
        description: "Default customer role",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        permissions: [
          { permission: { id: 5, action: "read", subject: "product", description: "View products" } },
        ],
      },
      {
        id: 4,
        name: "EDITOR",
        description: "Content editor role",
        createdAt: "2024-01-02T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
        permissions: [
          { permission: { id: 2, action: "read", subject: "product", description: "View products" } },
          { permission: { id: 6, action: "update", subject: "product", description: "Edit products" } },
        ],
      },
    ]);
  }),
  http.post("*/roles", async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json(
      {
        id: 99,
        name: body.name,
        description: body.description ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: (body.permissionIds ?? []).map((pid: number) => ({
          permission: { id: pid, action: "read", subject: "product" },
        })),
      },
      { status: 201 },
    );
  }),
  http.patch("*/roles/:id", async ({ params, request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      id: Number(params.id),
      name: body.name ?? "Updated Role",
      description: body.description ?? null,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: new Date().toISOString(),
      permissions: (body.permissionIds ?? []).map((pid: number) => ({
        permission: { id: pid, action: "read", subject: "product" },
      })),
    });
  }),
  http.delete("*/roles/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),
  // Permissions
  http.get("*/permissions", () => {
    return HttpResponse.json([
      { id: 1, action: "manage", subject: "all", description: "Full system access" },
      { id: 2, action: "read", subject: "product", description: "View products" },
      { id: 3, action: "create", subject: "product", description: "Create products" },
      { id: 4, action: "update", subject: "product", description: "Edit products" },
      { id: 5, action: "delete", subject: "product", description: "Delete products" },
      { id: 6, action: "read", subject: "user", description: "View users" },
      { id: 7, action: "create", subject: "user", description: "Create users" },
      { id: 8, action: "update", subject: "user", description: "Edit users" },
      { id: 9, action: "delete", subject: "user", description: "Delete users" },
      { id: 10, action: "read", subject: "order", description: "View orders" },
      { id: 11, action: "update", subject: "order", description: "Update orders" },
      { id: 12, action: "read", subject: "category", description: "View categories" },
      { id: 13, action: "create", subject: "category", description: "Create categories" },
      { id: 14, action: "read", subject: "role", description: "View roles" },
      { id: 15, action: "create", subject: "role", description: "Create roles" },
      { id: 16, action: "update", subject: "role", description: "Edit roles" },
      { id: 17, action: "delete", subject: "role", description: "Delete roles" },
      { id: 18, action: "read", subject: "analytics", description: "View analytics" },
      { id: 19, action: "read", subject: "review", description: "View reviews" },
      { id: 20, action: "update", subject: "review", description: "Approve/reject reviews" },
      { id: 21, action: "delete", subject: "review", description: "Delete reviews" },
      { id: 22, action: "read", subject: "coupon", description: "View coupons" },
      { id: 23, action: "create", subject: "coupon", description: "Create coupons" },
    ]);
  }),
  // Categories
  http.get("*/categories/admin", () => {
    return HttpResponse.json(categoryFixtures);
  }),
  http.post("*/categories", async ({ request }) => {
    const body = (await request.json()) as any;

    return HttpResponse.json(
      {
        id: 99,
        name: body.name,
        slug: String(body.name).toLowerCase().replaceAll(" ", "-"),
        description: body.description ?? "",
        parentId: body.parentId ?? null,
        parent: null,
        image: body.image ?? "",
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
        productCount: 0,
        createdAt: "2024-04-01T00:00:00.000Z",
        updatedAt: "2024-04-01T00:00:00.000Z",
      },
      { status: 201 },
    );
  }),
  http.patch("*/categories/:id", async ({ params, request }) => {
    const body = (await request.json()) as any;
    const existing =
      categoryFixtures.find((entry) => entry.id === Number(params.id)) ?? categoryFixtures[0];

    return HttpResponse.json({
      ...existing,
      ...body,
      id: Number(params.id),
      updatedAt: "2024-04-02T00:00:00.000Z",
    });
  }),
  http.delete("*/categories/:id", ({ request }) => {
    const url = new URL(request.url);
    const force = url.searchParams.get("force");

    return HttpResponse.json({ success: true, force });
  }),
  // Files
  http.post("*/files/upload", async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    return HttpResponse.json({
      url: `https://example.com/uploads/${file?.name ?? "uploaded-image.jpg"}`,
      filename: file?.name ?? "uploaded-image.jpg",
    });
  }),
  http.post("*/files/upload-multiple", async ({ request }) => {
    const formData = await request.formData();
    const files = formData.getAll("files[]") as File[];

    return HttpResponse.json({
      urls: files.map(
        (file, index) => `https://example.com/uploads/${index + 1}-${file.name}`,
      ),
      filenames: files.map((file) => file.name),
    });
  }),
  // Products
  http.get("*/products/admin/all", ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";
    const categoryId = url.searchParams.get("categoryId");
    const isActive = url.searchParams.get("isActive");
    const isFeatured = url.searchParams.get("isFeatured");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const sortBy = url.searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") ?? "DESC";

    let filtered = [...productFixtures];

    if (search) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.sku.toLowerCase().includes(search),
      );
    }

    if (categoryId) {
      filtered = filtered.filter(
        (product) => product.categoryId === Number(categoryId),
      );
    }

    if (isActive !== null) {
      filtered = filtered.filter(
        (product) => product.isActive === (isActive === "true"),
      );
    }

    if (isFeatured !== null) {
      filtered = filtered.filter(
        (product) => product.isFeatured === (isFeatured === "true"),
      );
    }

    if (minPrice) {
      filtered = filtered.filter(
        (product) => Number(product.price) >= Number(minPrice),
      );
    }

    if (maxPrice) {
      filtered = filtered.filter(
        (product) => Number(product.price) <= Number(maxPrice),
      );
    }

    filtered.sort((left, right) => {
      const leftValue =
        sortBy === "price"
          ? Number(left.price)
          : String(left[sortBy as keyof typeof left] ?? "");
      const rightValue =
        sortBy === "price"
          ? Number(right.price)
          : String(right[sortBy as keyof typeof right] ?? "");

      if (leftValue < rightValue) return sortOrder === "ASC" ? -1 : 1;
      if (leftValue > rightValue) return sortOrder === "ASC" ? 1 : -1;
      return 0;
    });

    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({
      data,
      meta: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        hasNextPage: start + limit < filtered.length,
        hasPreviousPage: page > 1,
      },
    });
  }),
  http.get("*/products/:id", ({ params }) => {
    const product = productFixtures.find((entry) => entry.id === Number(params.id));

    if (!product) {
      return HttpResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return HttpResponse.json(product);
  }),
  http.post("*/products", async ({ request }) => {
    const body = (await request.json()) as any;

    return HttpResponse.json(
      {
        id: 99,
        ...body,
        images: [],
        deletedAt: null,
        createdAt: "2024-04-01T00:00:00.000Z",
        updatedAt: "2024-04-01T00:00:00.000Z",
      },
      { status: 201 },
    );
  }),
  http.patch("*/products/:id", async ({ params, request }) => {
    const body = (await request.json()) as any;
    const existing =
      productFixtures.find((entry) => entry.id === Number(params.id)) ?? productFixtures[0];

    return HttpResponse.json({
      ...existing,
      ...body,
      id: Number(params.id),
      updatedAt: "2024-04-02T00:00:00.000Z",
    });
  }),
  http.patch("*/products/:id/stock", async ({ params, request }) => {
    const body = (await request.json()) as any;
    const existing =
      productFixtures.find((entry) => entry.id === Number(params.id)) ?? productFixtures[0];

    let stock = existing.stock;
    if (body.operation === "set") stock = body.quantity;
    if (body.operation === "increment") stock += body.quantity;
    if (body.operation === "decrement") stock -= body.quantity;

    return HttpResponse.json({
      ...existing,
      stock,
      id: Number(params.id),
      updatedAt: "2024-04-02T00:00:00.000Z",
    });
  }),
  http.post("*/products/:id/images", async ({ params, request }) => {
    const body = (await request.json()) as any;
    const existing =
      productFixtures.find((entry) => entry.id === Number(params.id)) ?? productFixtures[0];
    const images = body.images.map((image: any, index: number) => ({
      id: 200 + index,
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder ?? index,
    }));

    return HttpResponse.json({
      ...existing,
      id: Number(params.id),
      images: [...existing.images, ...images],
      updatedAt: "2024-04-02T00:00:00.000Z",
    });
  }),
  http.patch("*/products/:id/images/reorder", async ({ params, request }) => {
    const body = (await request.json()) as any;
    const existing =
      productFixtures.find((entry) => entry.id === Number(params.id)) ?? productFixtures[0];
    const reorderedImages = body.imageIds.map((imageId: number, index: number) => {
      const current = existing.images.find((image) => image.id === imageId);

      return {
        ...(current ?? existing.images[0]),
        id: imageId,
        sortOrder: index,
      };
    });

    return HttpResponse.json({
      ...existing,
      id: Number(params.id),
      images: reorderedImages,
      updatedAt: "2024-04-03T00:00:00.000Z",
    });
  }),
  http.delete("*/products/images/:imageId", () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.delete("*/products/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.patch("*/products/:id/restore", ({ params }) => {
    const existing =
      productFixtures.find((entry) => entry.id === Number(params.id)) ?? productFixtures[0];

    return HttpResponse.json({
      ...existing,
      id: Number(params.id),
      deletedAt: null,
      updatedAt: "2024-04-02T00:00:00.000Z",
    });
  }),
  // Orders
  http.get("*/orders/admin", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");

    const filteredOrders = orderFixtures.filter((order) => {
      if (status && order.status !== status) {
        return false;
      }

      if (dateFrom && new Date(order.createdAt) < new Date(dateFrom)) {
        return false;
      }

      if (dateTo && new Date(order.createdAt) > new Date(`${dateTo}T23:59:59.999Z`)) {
        return false;
      }

      return true;
    });

    const startIndex = (page - 1) * limit;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + limit);
    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / limit));

    return HttpResponse.json({
      data: paginatedOrders,
      meta: {
        total: filteredOrders.length,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  }),
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
  http.get("*/orders/:id", ({ params }) => {
    const order = orderFixtures.find((entry) => entry.id === Number(params.id));

    if (!order) {
      return HttpResponse.json(
        { message: "Order not found", statusCode: 404 },
        { status: 404 },
      );
    }

    return HttpResponse.json(order);
  }),
  http.patch("*/orders/:id/status", async ({ params, request }) => {
    const body = await request.json();
    const order = orderFixtures.find((entry) => entry.id === Number(params.id));

    if (!order) {
      return HttpResponse.json(
        { message: "Order not found", statusCode: 404 },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      ...order,
      status: body.status,
      updatedAt: "2024-03-17T00:00:00.000Z",
      shippedAt:
        body.status === "SHIPPED" ? "2024-03-17T00:00:00.000Z" : order.shippedAt,
      deliveredAt:
        body.status === "DELIVERED" ? "2024-03-18T00:00:00.000Z" : order.deliveredAt,
      cancelledAt:
        body.status === "CANCELLED" ? "2024-03-17T00:00:00.000Z" : order.cancelledAt,
    });
  }),
  // Coupons
  http.get("*/coupons", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const startIndex = (page - 1) * limit;
    const paginatedCoupons = couponFixtures.slice(startIndex, startIndex + limit);
    const totalPages = Math.max(1, Math.ceil(couponFixtures.length / limit));

    return HttpResponse.json({
      data: paginatedCoupons,
      meta: {
        total: couponFixtures.length,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  }),
  http.get("*/coupons/:id", ({ params }) => {
    const coupon = couponFixtures.find((entry) => entry.id === Number(params.id));

    if (!coupon) {
      return HttpResponse.json(
        { message: "Coupon not found", statusCode: 404 },
        { status: 404 },
      );
    }

    return HttpResponse.json(coupon);
  }),
  http.post("*/coupons", async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json(
      {
        id: 99,
        currentUses: 0,
        createdAt: "2024-03-20T00:00:00.000Z",
        updatedAt: "2024-03-20T00:00:00.000Z",
        ...body,
      },
      { status: 201 },
    );
  }),
  http.patch("*/coupons/:id", async ({ params, request }) => {
    const body = await request.json();
    const existing =
      couponFixtures.find((entry) => entry.id === Number(params.id)) ?? couponFixtures[0];

    return HttpResponse.json({
      ...existing,
      ...body,
      id: Number(params.id),
      updatedAt: "2024-03-20T00:00:00.000Z",
    });
  }),
  http.delete("*/coupons/:id", ({ params }) => {
    const coupon = couponFixtures.find((entry) => entry.id === Number(params.id));

    if (!coupon) {
      return HttpResponse.json(
        { message: "Coupon not found", statusCode: 404 },
        { status: 404 },
      );
    }

    if (coupon.currentUses > 0) {
      return HttpResponse.json(
        { message: "Coupon is already in use", statusCode: 400 },
        { status: 400 },
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),
  // Reviews
  http.get("*/reviews/pending", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const startIndex = (page - 1) * limit;
    const paginatedReviews = reviewFixtures.slice(startIndex, startIndex + limit);
    const totalPages = Math.max(1, Math.ceil(reviewFixtures.length / limit));

    return HttpResponse.json({
      data: paginatedReviews,
      meta: {
        total: reviewFixtures.length,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  }),
  http.patch("*/reviews/:id/approve", ({ params }) => {
    const review = reviewFixtures.find((entry) => entry.id === Number(params.id));

    if (!review) {
      return HttpResponse.json(
        { message: "Review not found", statusCode: 404 },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      ...review,
      status: "APPROVED",
      updatedAt: "2024-03-20T00:00:00.000Z",
    });
  }),
  http.patch("*/reviews/:id/reject", ({ params }) => {
    const review = reviewFixtures.find((entry) => entry.id === Number(params.id));

    if (!review) {
      return HttpResponse.json(
        { message: "Review not found", statusCode: 404 },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      ...review,
      status: "REJECTED",
      updatedAt: "2024-03-20T00:00:00.000Z",
    });
  }),
  http.delete("*/reviews/admin/:id", ({ params }) => {
    const review = reviewFixtures.find((entry) => entry.id === Number(params.id));

    if (!review) {
      return HttpResponse.json(
        { message: "Review not found", statusCode: 404 },
        { status: 404 },
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
