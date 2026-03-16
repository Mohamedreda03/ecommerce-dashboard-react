import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Plus, Edit, Trash2, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { useUsers, useDeleteUser, useRestoreUser } from "@/hooks/use-users";
import { useAuthStore } from "@/stores/auth.store";
import type { UserSafe } from "@/types/user.types";

import PageHeader from "@/components/shared/PageHeader";
import PermissionGuard from "@/components/shared/PermissionGuard";
import DataTable from "@/components/shared/DataTable";
import PaginationBar from "@/components/shared/PaginationBar";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import UserForm from "./components/UserForm";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUsers({ page, limit: 10 });
  const { hasPermission } = useAuthStore();

  const deleteMutation = useDeleteUser();
  const restoreMutation = useRestoreUser();

  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSafe | null>(null);

  // Dialog State
  const [userToDelete, setUserToDelete] = useState<UserSafe | null>(null);

  const canCreate = hasPermission("create:user");
  const canUpdate = hasPermission("update:user");
  const canDelete = hasPermission("delete:user");

  const openCreateSheet = () => {
    setEditingUser(null);
    setIsSheetOpen(true);
  };

  const openEditSheet = (user: UserSafe) => {
    setEditingUser(user);
    setIsSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteMutation.mutateAsync(userToDelete.id);
      toast.success("User deleted successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    } finally {
      setUserToDelete(null);
    }
  };

  const handleRestore = async (user: UserSafe) => {
    try {
      await restoreMutation.mutateAsync(user.id);
      toast.success("User restored successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to restore user");
    }
  };

  const columns = useMemo(() => {
    return [
      {
        header: "User",
        accessorKey: "firstName",
        cell: (user: UserSafe) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.firstName} />
              <AvatarFallback>
                {user.firstName?.charAt(0) ||
                  user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Link
                to={`/users/${user.id}`}
                className="font-medium hover:underline"
              >
                {user.firstName} {user.lastName}
              </Link>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: "Roles",
        accessorKey: "roles",
        cell: (user: UserSafe) => (
          <div className="flex flex-wrap gap-1">
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((r, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {r.role.name}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No roles</span>
            )}
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "isActive",
        cell: (user: UserSafe) => (
          <Badge variant={user.isActive ? "default" : "destructive"}>
            {user.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        header: "Joined",
        accessorKey: "createdAt",
        cell: (user: UserSafe) => (
          <span className="text-sm">
            {user.createdAt
              ? format(new Date(user.createdAt), "MMM d, yyyy")
              : "N/A"}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: (user: UserSafe) => (
          <div className="flex items-center gap-2">
            {canUpdate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditSheet(user)}
                title="Edit User"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && user.isActive && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setUserToDelete(user)}
                title="Delete User"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {canUpdate && !user.isActive && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRestore(user)}
                title="Restore User"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      },
    ];
  }, [canUpdate, canDelete, handleRestore]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users Management"
        description="Manage users, roles, and permissions."
        action={
          <PermissionGuard permission="create:user">
            <Button onClick={openCreateSheet}>
              <Plus className="mr-2 h-4 w-4" />
              New User
            </Button>
          </PermissionGuard>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
      />

      {data?.meta && <PaginationBar meta={data.meta} onPageChange={setPage} />}

      {/* Create / Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>
              {editingUser ? "Edit User" : "Create New User"}
            </SheetTitle>
          </SheetHeader>
          <UserForm
            user={editingUser}
            onSuccess={() => setIsSheetOpen(false)}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}? This action will soft-delete the user and block their access.`}
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
