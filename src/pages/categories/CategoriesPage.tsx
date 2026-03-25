import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Edit, FolderTree, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useCategoriesAdmin, useDeleteCategory } from "@/hooks/use-categories";
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

interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

function buildCategoryTree(categories: Category[]): CategoryWithChildren[] {
  const categoryMap = new Map<number, CategoryWithChildren>();

  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  const roots: CategoryWithChildren[] = [];

  categoryMap.forEach((category) => {
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(category);
      }
      return;
    }

    roots.push(category);
  });

  const sortTree = (nodes: CategoryWithChildren[]) => {
    nodes.sort(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
    );
    nodes.forEach((node) => sortTree(node.children));
  };

  sortTree(roots);
  return roots;
}

function flattenCategoryTree(
  nodes: CategoryWithChildren[],
  allCategories: Category[],
  depth = 0,
): CategoryRow[] {
  return nodes.flatMap((node) => {
    const parent = allCategories.find(
      (category) => category.id === node.parentId,
    );

    const current: CategoryRow = {
      ...node,
      depth,
      parentName: parent?.name ?? null,
    };

    return [
      current,
      ...flattenCategoryTree(node.children, allCategories, depth + 1),
    ];
  });
}

function getDescendantIds(
  categoryId: number,
  categories: Category[],
): number[] {
  const children = categories.filter(
    (category) => category.parentId === categoryId,
  );
  return children.flatMap((child) => [
    child.id,
    ...getDescendantIds(child.id, categories),
  ]);
}

export default function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategoriesAdmin();
  const deleteMutation = useDeleteCategory();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogCategory, setDeleteDialogCategory] =
    useState<Category | null>(null);

  const categoryRows = useMemo(() => {
    if (!categories) return [];
    const rows = flattenCategoryTree(buildCategoryTree(categories), categories);

    return rows.filter((category) => {
      const matchesSearch =
        search.trim() === "" ||
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        category.slug.toLowerCase().includes(search.toLowerCase()) ||
        (category.parentName ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? category.isActive : !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const parentOptions = useMemo(() => {
    if (!categories) return [];

    const blockedIds = editingCategory
      ? new Set([
          editingCategory.id,
          ...getDescendantIds(editingCategory.id, categories),
        ])
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
      toast.error(
        error?.response?.data?.message || "Failed to delete category",
      );
    } finally {
      setDeleteDialogCategory(null);
    }
  };
  const columns: ColumnDef<CategoryRow>[] = [
    {
      header: "Visual",
      className: "w-24",
      cell: (category) => (
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-surface-low ring-2 ring-white shadow-sm">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover transition-transform hover:scale-110"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-on-surface/20 uppercase tracking-tighter">
              Null
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Taxonomy Node",
      cell: (category) => (
        <div
          className="flex items-center gap-2"
          style={{ paddingLeft: `${category.depth * 2}rem` }}
        >
          {category.depth > 0 && (
            <div className="w-4 h-px bg-on-surface/20 relative">
              <div className="absolute top-[-3.5px] right-0 w-2 h-2 rounded-full bg-primary/40" />
            </div>
          )}
          <span
            className={cn(
              "font-bold text-sm tracking-tight",
              category.depth === 0 ? "text-on-surface" : "text-on-surface/70",
            )}
          >
            {category.name}
          </span>
        </div>
      ),
    },
    {
      header: "Identification",
      cell: (category) => (
        <code className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest bg-surface-low px-1.5 py-0.5 rounded">
          {category.slug}
        </code>
      ),
    },
    {
      header: "Census",
      cell: (category) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm">
            {category.productCount ?? 0}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface/40">
            Manifestations
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (category) => <StatusBadge status={category.isActive} />,
    },
    {
      header: "",
      className: "w-20 text-right",
      cell: (category) => (
        <div className="flex justify-end gap-1">
          <PermissionGuard permission="update:category">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-on-surface/40 hover:text-primary hover:bg-surface-low"
              onClick={() => handleEdit(category)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="delete:category">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-on-surface/40 hover:text-destructive hover:bg-surface-low"
              onClick={() => setDeleteDialogCategory(category)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-8 p-4 sm:p-8">
      <PageHeader
        title="Classification Taxonomy"
        description="Organize the digital catalog through a logical hierarchy of manifestations."
        action={
          <PermissionGuard permission="create:category">
            <Button
              onClick={handleCreate}
              className="shadow-lg shadow-primary/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              Define New Category
            </Button>
          </PermissionGuard>
        }
      />

      <div className="grid gap-6">
        <FilterToolbar className="md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-end gap-4">
          <div className="lg:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-2 block ml-1">
              Search Taxonomy
            </label>
            <Input
              placeholder="Search categorizations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 border-none bg-surface-low/50 text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-2 block ml-1">
              Availability State
            </label>
            <select
              aria-label="Category status"
              className="flex h-10 w-full rounded-lg border-none bg-surface-low/50 px-3 py-1 text-xs font-bold uppercase tracking-wider outline-none transition-all focus:ring-2 focus:ring-primary/20"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "all" | "active" | "inactive",
                )
              }
            >
              <option value="all">Full Spectrum</option>
              <option value="active">Active Tiers</option>
              <option value="inactive">Archived Tiers</option>
            </select>
          </div>
        </FilterToolbar>

        {isError ? (
          <div className="surface-layer-1 p-10 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <FolderTree className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-bold">
              Taxonomy Synchronization Failed
            </h3>
            <p className="text-sm text-on-surface/50 max-w-xs mx-auto mt-2">
              We encountered a disruption while retrieving the categorization
              hierarchy.
            </p>
          </div>
        ) : !isLoading && categoryRows.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="h-12 w-12 text-on-surface/10" />}
            title="Registry Void"
            message="The taxonomy is currently unpopulated. Begin the logical structuring of your catalog."
            action={
              <PermissionGuard permission="create:category">
                <Button
                  variant="outline"
                  onClick={handleCreate}
                  className="border-on-surface/10 hover:bg-surface-low"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Initialize Category
                </Button>
              </PermissionGuard>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={categoryRows}
            isLoading={isLoading}
            emptyMessage="No categorizations match the current filter parameters."
          />
        )}
      </div>

      <Sheet
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingCategory(null);
          }
        }}
      >
        <SheetContent className="sm:max-w-xl glass-effect border-none shadow-2xl p-0">
          <div className="p-10 flex flex-col h-full bg-surface-layer-1">
            <SheetHeader className="mb-10 text-left">
              <SheetTitle className="text-3xl font-bold tracking-tight">
                {editingCategory ? "Refine Classification" : "Initialize Tier"}
              </SheetTitle>
              <SheetDescription className="text-xs font-medium text-on-surface/40 uppercase tracking-widest">
                {editingCategory
                  ? `Adjusting the parameters for ${editingCategory.name}.`
                  : "Structure a new logical node within the catalog hierarchy."}
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
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteDialogCategory}
        onOpenChange={(open) => !open && setDeleteDialogCategory(null)}
        title={
          (deleteDialogCategory?.productCount ?? 0) > 0
            ? "Dissolve Populated Tier"
            : "Dissolve Category"
        }
        description={
          (deleteDialogCategory?.productCount ?? 0) > 0
            ? `The "${deleteDialogCategory?.name}" classification contains active manifestations. Dissolving this tier will cascade all related catalog entries.`
            : `Are you sure you want to dissolve "${deleteDialogCategory?.name}" from the taxonomy?`
        }
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
