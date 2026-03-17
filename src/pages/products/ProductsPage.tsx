import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Edit,
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { useDebounce } from "@/hooks/use-debounce";
import {
  useDeleteProduct,
  useProductsAdmin,
  useRestoreProduct,
  useUpdateStock,
} from "@/hooks/use-products";
import { useCategoriesAdmin } from "@/hooks/use-categories";
import type { Product, ProductQuery } from "@/types/product.types";
import { formatCurrency } from "@/lib/utils";

import PageHeader from "@/components/shared/PageHeader";
import PermissionGuard from "@/components/shared/PermissionGuard";
import DataTable, { type ColumnDef } from "@/components/shared/DataTable";
import PaginationBar from "@/components/shared/PaginationBar";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import FilterToolbar from "@/components/shared/FilterToolbar";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type StockOperation = "set" | "increment" | "decrement";

const DEFAULT_QUERY: ProductQuery = {
  page: 1,
  limit: 10,
  search: "",
  sortBy: "createdAt",
  sortOrder: "DESC",
};

export default function ProductsPage() {
  const [query, setQuery] = useState<ProductQuery>(DEFAULT_QUERY);
  const [deleteDialogProduct, setDeleteDialogProduct] = useState<Product | null>(null);

  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState("0");
  const [stockOperation, setStockOperation] = useState<StockOperation>("set");

  const debouncedSearch = useDebounce(query.search, 300);

  const { data: productsData, isLoading } = useProductsAdmin({
    ...query,
    search: debouncedSearch,
  });
  const { data: categories } = useCategoriesAdmin();

  const deleteMutation = useDeleteProduct();
  const restoreMutation = useRestoreProduct();
  const stockMutation = useUpdateStock();

  const updateQuery = (updates: Partial<ProductQuery>) => {
    setQuery((current) => ({
      ...current,
      ...updates,
    }));
  };

  const handleDelete = async () => {
    if (!deleteDialogProduct) return;

    try {
      await deleteMutation.mutateAsync(deleteDialogProduct.id);
      toast.success("Product deleted successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleteDialogProduct(null);
    }
  };

  const handleRestore = async (product: Product) => {
    try {
      await restoreMutation.mutateAsync(product.id);
      toast.success(`"${product.name}" restored successfully`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to restore product");
    }
  };

  const handleUpdateStock = async (event: React.FormEvent, productId: number) => {
    event.preventDefault();

    try {
      await stockMutation.mutateAsync({
        id: productId,
        data: {
          quantity: Number(stockQuantity),
          operation: stockOperation,
        },
      });
      toast.success("Stock updated successfully");
      setEditingStockId(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update stock");
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      header: "Image",
      className: "w-16",
      cell: (product) => (
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {product.images[0] ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      header: "Name",
      cell: (product) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{product.name}</span>
          {product.deletedAt && (
            <span className="text-xs text-muted-foreground">Soft deleted</span>
          )}
        </div>
      ),
    },
    {
      header: "SKU",
      accessorKey: "sku",
    },
    {
      header: "Category",
      cell: (product) => {
        const category = categories?.find((entry) => entry.id === product.categoryId);
        return category?.name ?? "Uncategorized";
      },
    },
    {
      header: "Price",
      cell: (product) => formatCurrency(Number(product.price)),
    },
    {
      header: "Stock",
      cell: (product) => {
        const isLowStock = product.stock < product.lowStockThreshold;

        return (
          <div className="flex items-center gap-2">
            <Popover
              open={editingStockId === product.id}
              onOpenChange={(open) => {
                if (!open) {
                  setEditingStockId(null);
                  return;
                }

                setEditingStockId(product.id);
                setStockQuantity(String(product.stock));
                setStockOperation("set");
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-sm font-normal"
                >
                  {product.stock}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72">
                <form
                  onSubmit={(event) => handleUpdateStock(event, product.id)}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">Update Stock</h4>
                    <p className="text-sm text-muted-foreground">
                      Adjust inventory for {product.name}.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Select
                      value={stockOperation}
                      onValueChange={(value: StockOperation) => setStockOperation(value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="set">Set</SelectItem>
                        <SelectItem value="increment">Add</SelectItem>
                        <SelectItem value="decrement">Remove</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={(event) => setStockQuantity(event.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={stockMutation.isPending}
                  >
                    Save
                  </Button>
                </form>
              </PopoverContent>
            </Popover>

            {isLowStock && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Low stock
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      cell: (product) => <StatusBadge status={product.isActive} />,
    },
    {
      header: "Featured",
      cell: (product) =>
        product.isFeatured ? (
          <Badge variant="secondary">Featured</Badge>
        ) : (
          <span className="text-muted-foreground">No</span>
        ),
    },
    {
      header: "",
      className: "w-[60px] text-right",
      cell: (product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open actions</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <PermissionGuard permission="update:product">
              <DropdownMenuItem asChild>
                <Link to={`/products/${product.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
            </PermissionGuard>

            {product.deletedAt ? (
              <PermissionGuard permission="update:product">
                <DropdownMenuItem onClick={() => handleRestore(product)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore
                </DropdownMenuItem>
              </PermissionGuard>
            ) : (
              <PermissionGuard permission="delete:product">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteDialogProduct(product)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </PermissionGuard>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your inventory, pricing, and product details."
        action={
          <PermissionGuard permission="create:product">
            <Button asChild>
              <Link to="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                New Product
              </Link>
            </Button>
          </PermissionGuard>
        }
      />

      <FilterToolbar className="md:grid-cols-2 xl:grid-cols-6">
        <Input
          placeholder="Search name or SKU..."
          value={query.search}
          onChange={(event) =>
            updateQuery({ search: event.target.value, page: 1 })
          }
        />

        <Select
          value={query.categoryId ? String(query.categoryId) : "all"}
          onValueChange={(value) =>
            updateQuery({
              categoryId: value === "all" ? undefined : Number(value),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={
            query.isActive === undefined
              ? "all"
              : query.isActive
                ? "active"
                : "inactive"
          }
          onValueChange={(value) =>
            updateQuery({
              isActive:
                value === "all" ? undefined : value === "active",
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={
            query.isFeatured === undefined
              ? "all"
              : query.isFeatured
                ? "featured"
                : "standard"
          }
          onValueChange={(value) =>
            updateQuery({
              isFeatured:
                value === "all" ? undefined : value === "featured",
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="featured">Featured only</SelectItem>
            <SelectItem value="standard">Standard only</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min="0"
            placeholder="Min price"
            value={query.minPrice ?? ""}
            onChange={(event) =>
              updateQuery({
                minPrice: event.target.value || undefined,
                page: 1,
              })
            }
          />
          <Input
            type="number"
            min="0"
            placeholder="Max price"
            value={query.maxPrice ?? ""}
            onChange={(event) =>
              updateQuery({
                maxPrice: event.target.value || undefined,
                page: 1,
              })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select
            value={query.sortBy ?? "createdAt"}
            onValueChange={(value) => updateQuery({ sortBy: value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={query.sortOrder ?? "DESC"}
            onValueChange={(value: "ASC" | "DESC") =>
              updateQuery({ sortOrder: value, page: 1 })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">Desc</SelectItem>
              <SelectItem value="ASC">Asc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={productsData?.data ?? []}
        isLoading={isLoading}
        emptyMessage="No products found matching your filters."
      />

      {productsData?.meta && (
        <PaginationBar
          meta={productsData.meta}
          onPageChange={(page) => updateQuery({ page })}
        />
      )}

      <ConfirmDialog
        open={!!deleteDialogProduct}
        onOpenChange={(open) => !open && setDeleteDialogProduct(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteDialogProduct?.name}"? It will be hidden from the storefront until restored.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
