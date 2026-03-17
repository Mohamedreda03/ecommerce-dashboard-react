import { useMemo, useState } from "react";
import { Plus, Trash2, Edit, Shield } from "lucide-react";
import { toast } from "sonner";

import { useRoles, useDeleteRole } from "@/hooks/use-roles";
import type { Role } from "@/types/role.types";

import PageHeader from "@/components/shared/PageHeader";
import PermissionGuard from "@/components/shared/PermissionGuard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import FilterToolbar from "@/components/shared/FilterToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import RoleForm from "./components/RoleForm";
import PermissionsTable from "./components/PermissionsTable";

const BUILT_IN_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "CUSTOMER"]);

export default function RolesPage() {
  const { data: roles, isLoading, isError } = useRoles();
  const deleteMutation = useDeleteRole();

  const [search, setSearch] = useState("");
  const [roleScope, setRoleScope] = useState<"all" | "built-in" | "custom">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [deleteDialogRole, setDeleteDialogRole] = useState<Role | null>(null);

  const handleCreate = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteDialogRole) return;
    try {
      await deleteMutation.mutateAsync(deleteDialogRole.id);
      toast.success("Role deleted successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete role");
    } finally {
      setDeleteDialogRole(null);
    }
  };

  const formSuccess = () => {
    setIsFormOpen(false);
    setEditingRole(null);
  };

  const formCancel = () => {
    setIsFormOpen(false);
    setEditingRole(null);
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingRole(null);
    }
  };

  const filteredRoles = useMemo(() => {
    return (roles ?? []).filter((role) => {
      const isBuiltIn = BUILT_IN_ROLES.has(role.name);
      const matchesSearch =
        search.trim() === "" ||
        role.name.toLowerCase().includes(search.toLowerCase()) ||
        (role.description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesScope =
        roleScope === "all" ||
        (roleScope === "built-in" ? isBuiltIn : !isBuiltIn);

      return matchesSearch && matchesScope;
    });
  }, [roles, search, roleScope]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Roles & Permissions"
        description="Manage system roles and their associated permissions."
        action={
          <PermissionGuard permission="create:role">
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Role
            </Button>
          </PermissionGuard>
        }
      />

      <FilterToolbar className="md:grid-cols-2">
        <Input
          placeholder="Search roles..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          aria-label="Role scope"
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={roleScope}
          onChange={(event) =>
            setRoleScope(event.target.value as "all" | "built-in" | "custom")
          }
        >
          <option value="all">All roles</option>
          <option value="built-in">Core roles</option>
          <option value="custom">Custom</option>
        </select>
      </FilterToolbar>

      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-5 w-1/4" />
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 justify-end w-full border-t pt-4">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            Failed to load roles. Please try again later.
          </div>
        ) : !roles || roles.length === 0 ? (
          <EmptyState
            icon={<Shield className="h-10 w-10 text-muted-foreground" />}
            title="No Roles Found"
            message="Get started by creating a new role for your system."
            action={
              <PermissionGuard permission="create:role">
                <Button onClick={handleCreate} variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Role
                </Button>
              </PermissionGuard>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => {
              const isBuiltIn = BUILT_IN_ROLES.has(role.name);
              const permissionCount = role.permissions?.length ?? 0;

              return (
                <Card key={role.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {role.name}
                        {isBuiltIn && (
                          <Badge variant="secondary" className="text-xs">
                            Built-in
                          </Badge>
                        )}
                      </CardTitle>
                      <Badge variant="outline">
                        {permissionCount} {permissionCount === 1 ? "permission" : "permissions"}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {role.description || "No description provided for this role."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium bg-muted/50 p-2.5 rounded-md">
                      <Shield className="h-4 w-4 shrink-0 text-primary" />
                      {role.name === "SUPER_ADMIN" ? (
                        <span>Full System Access (manage:all)</span>
                      ) : (
                        <span>
                          {permissionCount} Assigned{" "}
                          {permissionCount === 1
                            ? "Permission"
                            : "Permissions"}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 pt-4 border-t bg-muted/10">
                    <PermissionGuard permission="update:role">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(role)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard permission="delete:role">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDialogRole(role)}
                        disabled={isBuiltIn}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </PermissionGuard>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        <div className="pt-8 relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Available Permissions Scope
            </span>
          </div>
        </div>
        
        <PermissionsTable />
      </div>

      <Sheet open={isFormOpen} onOpenChange={handleFormOpenChange}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingRole ? "Edit Role" : "Create New Role"}</SheetTitle>
            <SheetDescription>
              {editingRole
                ? `Update permissions for ${editingRole.name}`
                : "Add a new role to the system and assign permissions."}
            </SheetDescription>
          </SheetHeader>
          <RoleForm
            role={editingRole}
            onSuccess={formSuccess}
            onCancel={formCancel}
          />
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteDialogRole}
        onOpenChange={(open) => !open && setDeleteDialogRole(null)}
        title="Delete Role"
        description={`Are you sure you want to delete the "${deleteDialogRole?.name}" role? This action cannot be undone and may affect users currently assigned this role.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
