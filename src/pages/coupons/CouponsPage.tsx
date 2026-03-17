import { useState } from "react";
import { Edit, Percent, Plus, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useCoupons, useDeleteCoupon } from "@/hooks/use-coupons";
import {
  DiscountType,
  type Coupon,
  type CouponQuery,
} from "@/types/coupon.types";
import { formatCurrency, formatDate } from "@/lib/utils";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DataTable, { type ColumnDef } from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import FilterToolbar from "@/components/shared/FilterToolbar";
import PageHeader from "@/components/shared/PageHeader";
import PaginationBar from "@/components/shared/PaginationBar";
import PermissionGuard from "@/components/shared/PermissionGuard";
import StatusBadge from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import CouponForm from "./components/CouponForm";

const DEFAULT_QUERY: CouponQuery = {
  page: 1,
  limit: 10,
};

function renderDiscountValue(coupon: Coupon) {
  if (coupon.discountType === DiscountType.PERCENTAGE) {
    return `${coupon.discountValue}%`;
  }

  return formatCurrency(coupon.discountValue);
}

export default function CouponsPage() {
  const [query, setQuery] = useState<CouponQuery>(DEFAULT_QUERY);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | DiscountType>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteDialogCoupon, setDeleteDialogCoupon] = useState<Coupon | null>(null);

  const { data: couponsData, isLoading, isError } = useCoupons(query);
  const deleteMutation = useDeleteCoupon();

  const filteredCoupons = (couponsData?.data ?? []).filter((coupon) => {
    const matchesSearch =
      search.trim() === "" ||
      coupon.code.toLowerCase().includes(search.toLowerCase()) ||
      (coupon.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? coupon.isActive : !coupon.isActive);
    const matchesType =
      typeFilter === "all" || coupon.discountType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreate = () => {
    setEditingCoupon(null);
    setIsFormOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteDialogCoupon) return;

    try {
      await deleteMutation.mutateAsync(deleteDialogCoupon.id);
      toast.success("Coupon deleted successfully");
      setDeleteDialogCoupon(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete coupon");
    }
  };

  const columns: ColumnDef<Coupon>[] = [
    {
      header: "Code",
      cell: (coupon) => <span className="font-medium">{coupon.code}</span>,
    },
    {
      header: "Type",
      cell: (coupon) => (
        <Badge variant="outline">{coupon.discountType}</Badge>
      ),
    },
    {
      header: "Value",
      cell: (coupon) => renderDiscountValue(coupon),
    },
    {
      header: "Min Order",
      cell: (coupon) =>
        coupon.minOrderAmount ? formatCurrency(coupon.minOrderAmount) : "N/A",
    },
    {
      header: "Usage",
      cell: (coupon) =>
        `${coupon.currentUses} / ${coupon.maxUses ?? "Unlimited"}`,
    },
    {
      header: "Status",
      cell: (coupon) => <StatusBadge status={coupon.isActive} />,
    },
    {
      header: "Validity",
      cell: (coupon) => (
        <div className="flex flex-col gap-1 text-sm">
          <span>{coupon.startsAt ? formatDate(coupon.startsAt) : "No start date"}</span>
          <span className="text-muted-foreground">
            {coupon.expiresAt ? `Ends ${formatDate(coupon.expiresAt)}` : "No expiry"}
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "w-44",
      cell: (coupon) => (
        <div className="flex gap-2">
          <PermissionGuard permission="update:coupon">
            <Button variant="outline" size="sm" onClick={() => handleEdit(coupon)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="delete:coupon">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogCoupon(coupon)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons"
        description="Manage discount campaigns, validity windows, and usage caps."
        action={
          <PermissionGuard permission="create:coupon">
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Coupon
            </Button>
          </PermissionGuard>
        }
      />

      <FilterToolbar className="md:grid-cols-3">
        <Input
          placeholder="Search code or description..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          aria-label="Coupon status"
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "all" | "active" | "inactive")
          }
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          aria-label="Coupon type"
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as "all" | DiscountType)
          }
        >
          <option value="all">All types</option>
          <option value={DiscountType.PERCENTAGE}>Percentage</option>
          <option value={DiscountType.FIXED_AMOUNT}>Fixed amount</option>
        </select>
      </FilterToolbar>

      {isError ? (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          Failed to load coupons. Please try again later.
        </div>
      ) : !isLoading && (couponsData?.data.length ?? 0) === 0 ? (
        <EmptyState
          icon={<Tag className="h-10 w-10 text-muted-foreground" />}
          title="No Coupons Found"
          message="Create a discount code to start promoting offers."
          action={
            <PermissionGuard permission="create:coupon">
              <Button variant="outline" onClick={handleCreate}>
                <Percent className="mr-2 h-4 w-4" />
                Add Coupon
              </Button>
            </PermissionGuard>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredCoupons}
          isLoading={isLoading}
          emptyMessage="No coupons found."
        />
      )}

      {couponsData?.meta && (
        <PaginationBar
          meta={couponsData.meta}
          onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
        />
      )}

      <Sheet
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingCoupon(null);
          }
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-2xl">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</SheetTitle>
            <SheetDescription>
              {editingCoupon
                ? `Update ${editingCoupon.code} and its discount rules.`
                : "Create a new coupon and define its validity rules."}
            </SheetDescription>
          </SheetHeader>

          <CouponForm
            coupon={editingCoupon}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingCoupon(null);
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingCoupon(null);
            }}
          />
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteDialogCoupon}
        onOpenChange={(open) => !open && setDeleteDialogCoupon(null)}
        title="Delete Coupon"
        description={`Are you sure you want to delete "${deleteDialogCoupon?.code}"? Coupons already in use will be rejected by the server.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
