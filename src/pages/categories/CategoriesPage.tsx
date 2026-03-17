import { useMemo, useState } from "react";
import { Edit, FolderTree, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  useCategoriesAdmin,
  useDeleteCategory,
} from "@/hooks/use-categories";
import type { Category } from "@/types/category.types";
import PageHeader from "@/components/shared/PageHeader";
import PermissionGuard from "@/components/shared/PermissionGuard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import DataTable, { type ColumnDef } from "@/components/shared/DataTable";
import FilterToolbar from "@/components/shared/FilterToolbar";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import CategoryForm from "./components/CategoryForm";

interface CategoryRow extends Category {
  depth: number;
  parentName: string | null;
}

function buildCategoryTree(categories: Category[]) {
  const categoryMap = new Map<number, Category & { children: Category[] }>();

  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  const roots: Array<Category & { children: Category[] }> = [];

  categoryMap.forEach((category) => {
    if (category.parentId) {
      categoryMap.get(category.parentId)?.children.push(category);
      return;
    }

    roots.push(category);
  });

  const sortTree = (nodes: Array<Category & { children: Category[] }>) => {
    nodes.sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));
    nodes.forEach((node) => sortTree(node.children));
  };

  sortTree(roots);
  return roots;
}

function flattenCategoryTree(
  nodes: Array<Category & { children: Category[] }>,
  allCategories: Category[],
  depth = 0,
): CategoryRow[] {
  return nodes.flatMap((node) => {
    const parent = allCategories.find((category) => category.id === node.parentId);

    const current: CategoryRow = {
      ...node,
      depth,
      parentName: parent?.name ?? null,
    };

    return [current, ...flattenCategoryTree(node.children, allCategories, depth + 1)];
  });
}

function getDescendantIds(categoryId: number, categories: Category[]) {
  const children = categories.filter((category) => category.parentId === categoryId);
  return children.flatMap((child) => [child.id, ...getDescendantIds(child.id, categories)]);
}

export default function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategoriesAdmin();
  const deleteMutation = useDeleteCategory();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogCategory, setDeleteDialogCategory] = useState<Category | null>(null);

  const categoryRows = useMemo(() => {
    if (!categories) return [];
    const rows = flattenCategoryTree(buildCategoryTree(categories), categories);

    return rows.filter((category) => {
      const matchesSearch =
        search.trim() === "" ||
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        category.slug.toLowerCase().includes(search.toLowerCase()) ||
        (category.parentName ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? category.isActive : !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const parentOptions = useMemo(() => {
    if (!categories) return [];

    const blockedIds = editingCategory
      ? new Set([editingCategory.id, ...getDescendantIds(editingCategory.id, categories)])
      : new Set<number>();

    return flattenCategoryTree(buildCategoryTree(categories), categories)
      .filter((category) => !blockedIds.has(category.id))
      .map((category) => ({
        id: category.id,
        label: `${"  ".repeat(category.depth)}${category.depth > 0 ? "↳ " : ""}${category.name}`,
      }));
  }, [categories, editingCategory]);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteDialogCategory) return;

    const shouldForceDelete = (deleteDialogCategory.productCount ?? 0) > 0;

    try {
      await deleteMutation.mutateAsync({
        id: deleteDialogCategory.id,
        force: shouldForceDelete,
      });
      toast.success("Category deleted successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete category");
    } finally {
      setDeleteDialogCategory(null);
    }
  };

  const columns: ColumnDef<CategoryRow>[] = [
    {
      header: "Image",
      className: "w-20",
      cell: (category) =>
        category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="h-12 w-12 rounded-md border object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
            N/A
          </div>
        ),
    },
    {
      header: "Name",
      cell: (category) => (
        <div
          className="font-medium"
          style={{ paddingLeft: `${category.depth * 1.5}rem` }}
        >
          {category.depth > 0 ? "↳ " : ""}
          {category.name}
        </div>
      ),
    },
    {
      header: "Slug",
      accessorKey: "slug",
    },
    {
      header: "Parent",
      cell: (category) => category.parentName ?? "Root",
    },
    {
      header: "Products",
      cell: (category) => String(category.productCount ?? 0),
    },
    {
      header: "Status",
      cell: (category) => <StatusBadge status={category.isActive} />,
    },
    {
      header: "Sort Order",
      cell: (category) => String(category.sortOrder),
    },
    {
      header: "Actions",
      className: "w-44",
      cell: (category) => (
        <div className="flex gap-2">
          <PermissionGuard permission="update:category">
            <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="delete:category">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogCategory(category)}
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
        title="Categories"
        description="Organize products into parent and child category trees."
        action={
          <PermissionGuard permission="create:category">
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </PermissionGuard>
        }
      />

      <FilterToolbar className="md:grid-cols-2">
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          aria-label="Category status"
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
      </FilterToolbar>

      {isError ? (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          Failed to load categories. Please try again later.
        </div>
      ) : !isLoading && categoryRows.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="h-10 w-10 text-muted-foreground" />}
          title="No Categories Found"
          message="Create your first category to start organizing products."
          action={
            <PermissionGuard permission="create:category">
              <Button variant="outline" onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </PermissionGuard>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={categoryRows}
          isLoading={isLoading}
          emptyMessage="No categories found."
        />
      )}

      <Sheet
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingCategory(null);
          }
        }}
      >
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingCategory ? "Edit Category" : "Create Category"}</SheetTitle>
            <SheetDescription>
              {editingCategory
                ? `Update settings for ${editingCategory.name}.`
                : "Create a new category and place it in the tree."}
            </SheetDescription>
          </SheetHeader>

          <CategoryForm
            category={editingCategory}
            parentOptions={parentOptions}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingCategory(null);
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingCategory(null);
            }}
          />
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteDialogCategory}
        onOpenChange={(open) => !open && setDeleteDialogCategory(null)}
        title={
          (deleteDialogCategory?.productCount ?? 0) > 0
            ? "Force Delete Category"
            : "Delete Category"
        }
        description={
          (deleteDialogCategory?.productCount ?? 0) > 0
            ? `The "${deleteDialogCategory?.name}" category contains products. Confirming will force delete it and cascade to related records.`
            : `Are you sure you want to delete "${deleteDialogCategory?.name}"?`
        }
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
