import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

import { useOrdersAdmin } from "@/hooks/use-orders";
import {
  OrderStatus,
  type Order,
  type OrdersAdminQuery,
} from "@/types/order.types";
import { formatCurrency, formatDate } from "@/lib/utils";

import PageHeader from "@/components/shared/PageHeader";
import DataTable, { type ColumnDef } from "@/components/shared/DataTable";
import PaginationBar from "@/components/shared/PaginationBar";
import FilterToolbar from "@/components/shared/FilterToolbar";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ORDER_STATUS_OPTIONS = Object.values(OrderStatus);

const DEFAULT_QUERY: OrdersAdminQuery = {
  page: 1,
  limit: 10,
};

function getCustomerName(order: Order) {
  const fullName = `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim();
  return fullName || "Unknown customer";
}

export default function OrdersPage() {
  const [query, setQuery] = useState<OrdersAdminQuery>(DEFAULT_QUERY);
  const { data: ordersData, isLoading } = useOrdersAdmin(query);

  const updateQuery = (updates: Partial<OrdersAdminQuery>) => {
    setQuery((current) => ({
      ...current,
      ...updates,
    }));
  };

  const columns: ColumnDef<Order>[] = [
    {
      header: "Order",
      cell: (order) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{order.orderNumber}</span>
          <span className="text-xs text-muted-foreground">#{order.id}</span>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (order) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{getCustomerName(order)}</span>
          <span className="text-sm text-muted-foreground">{order.user.email}</span>
        </div>
      ),
    },
    {
      header: "Total",
      cell: (order) => formatCurrency(order.totalAmount),
    },
    {
      header: "Status",
      cell: (order) => <StatusBadge status={order.status} />,
    },
    {
      header: "Payment",
      cell: (order) => (
        <StatusBadge status={order.payment?.status ?? "UNPAID"} />
      ),
    },
    {
      header: "Created",
      cell: (order) => formatDate(order.createdAt),
    },
    {
      header: "Actions",
      className: "w-32",
      cell: (order) => (
        <Button asChild variant="outline" size="sm">
          <Link to={`/orders/${order.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Monitor order progress, payment state, and fulfillment updates."
      />

      <FilterToolbar className="md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="order-status-filter" className="text-sm font-medium">
            Status
          </label>
          <select
            id="order-status-filter"
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={query.status ?? "all"}
            onChange={(event) =>
              updateQuery({
                status:
                  event.target.value === "all"
                    ? undefined
                    : (event.target.value as OrderStatus),
                page: 1,
              })
            }
          >
            <option value="all">All statuses</option>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="order-date-from" className="text-sm font-medium">
            Date from
          </label>
          <Input
            id="order-date-from"
            type="date"
            value={query.dateFrom ?? ""}
            onChange={(event) =>
              updateQuery({
                dateFrom: event.target.value || undefined,
                page: 1,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="order-date-to" className="text-sm font-medium">
            Date to
          </label>
          <Input
            id="order-date-to"
            type="date"
            value={query.dateTo ?? ""}
            onChange={(event) =>
              updateQuery({
                dateTo: event.target.value || undefined,
                page: 1,
              })
            }
          />
        </div>
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={ordersData?.data ?? []}
        isLoading={isLoading}
        emptyMessage="No orders found matching your filters."
      />

      {ordersData?.meta && (
        <PaginationBar
          meta={ordersData.meta}
          onPageChange={(page) => updateQuery({ page })}
        />
      )}
    </div>
  );
}
