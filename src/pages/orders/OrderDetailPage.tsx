import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useOrder, useUpdateOrderStatus } from "@/hooks/use-orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatus, type OrderItem } from "@/types/order.types";

import PageHeader from "@/components/shared/PageHeader";
import PermissionGuard from "@/components/shared/PermissionGuard";
import DataTable, { type ColumnDef } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ORDER_STATUS_OPTIONS = Object.values(OrderStatus);

const NEXT_STATUS_MAP: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

function formatAddress(address: {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}) {
  return [
    `${address.firstName} ${address.lastName}`,
    address.addressLine1,
    address.addressLine2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
    address.phone,
  ].filter(Boolean);
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = Number(id);

  const { data: order, isLoading, isError } = useOrder(orderId);
  const updateStatusMutation = useUpdateOrderStatus();
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const validNextStatuses = useMemo(
    () => (order ? NEXT_STATUS_MAP[order.status] : []),
    [order],
  );

  const itemColumns: ColumnDef<OrderItem>[] = [
    {
      header: "Product",
      accessorKey: "productName",
    },
    {
      header: "SKU",
      accessorKey: "sku",
    },
    {
      header: "Qty",
      cell: (item) => String(item.quantity),
    },
    {
      header: "Unit Price",
      cell: (item) => formatCurrency(item.unitPrice),
    },
    {
      header: "Total",
      cell: (item) => formatCurrency(item.totalPrice),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={() => navigate("/orders")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <div className="text-destructive">Failed to load order details.</div>
      </div>
    );
  }

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        data: { status: selectedStatus as OrderStatus },
      });
      toast.success("Order status updated successfully");
      setSelectedStatus("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update order status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={order.orderNumber}
          description={`Placed on ${formatDate(order.createdAt)} and last updated ${formatDate(order.updatedAt)}.`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Header</CardTitle>
              <CardDescription>High-level status and fulfillment milestones.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-medium">{order.orderNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Status</p>
                <StatusBadge status={order.status} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Shipped / Delivered</p>
                <p className="font-medium">
                  {order.shippedAt ? formatDate(order.shippedAt) : "Not shipped"}
                  {" / "}
                  {order.deliveredAt ? formatDate(order.deliveredAt) : "Not delivered"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Snapshot of purchased products and pricing.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={itemColumns} data={order.items} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
                <CardDescription>Saved shipping snapshot for this order.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {formatAddress(order.shippingAddressSnapshot).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
                <CardDescription>Saved billing snapshot for this order.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {formatAddress(order.billingAddressSnapshot).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
              <CardDescription>Account snapshot attached to this order.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">
                {[order.user.firstName, order.user.lastName].filter(Boolean).join(" ") ||
                  "Unknown customer"}
              </p>
              <p>{order.user.email}</p>
              <p className="text-muted-foreground">User ID: {order.userId}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
              <CardDescription>Latest Stripe payment intent state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <StatusBadge status={order.payment?.status ?? "UNPAID"} />
              <p>Provider: {order.payment?.provider ?? "N/A"}</p>
              <p>Transaction: {order.payment?.transactionId ?? "N/A"}</p>
              <p>Total charged: {formatCurrency(order.totalAmount)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coupon</CardTitle>
              <CardDescription>Applied discount snapshot.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.coupon ? (
                <>
                  <p className="font-medium">{order.coupon.code}</p>
                  <p>{order.coupon.discountType}</p>
                  <p>Value: {order.coupon.discountValue}</p>
                  <p>Discount applied: {formatCurrency(order.discountAmount)}</p>
                </>
              ) : (
                <p className="text-muted-foreground">No coupon applied.</p>
              )}
            </CardContent>
          </Card>

          <PermissionGuard permission="update:order">
            <Card>
              <CardHeader>
                <CardTitle>Status Update</CardTitle>
                <CardDescription>
                  Valid next statuses stay enabled. Invalid transitions remain visible but disabled.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="order-status-update" className="text-sm font-medium">
                    Next status
                  </label>
                  <select
                    id="order-status-update"
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                  >
                    <option value="">Select next status</option>
                    {ORDER_STATUS_OPTIONS.map((status) => (
                      <option
                        key={status}
                        value={status}
                        disabled={!validNextStatuses.includes(status)}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleStatusUpdate}
                  disabled={!selectedStatus || updateStatusMutation.isPending}
                >
                  Confirm Status Update
                </Button>
              </CardContent>
            </Card>
          </PermissionGuard>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/orders">Back to Orders</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
