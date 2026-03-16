import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { useUser } from "@/hooks/use-users";
import { useRoles, useAssignRole, useRevokeRole } from "@/hooks/use-roles";
import { useAuthStore } from "@/stores/auth.store";

import PageHeader from "@/components/shared/PageHeader";
import PermissionGuard from "@/components/shared/PermissionGuard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = Number(id);

  const { data: user, isLoading, isError } = useUser(userId);
  const { data: roles } = useRoles();
  const assignMutation = useAssignRole();
  const revokeMutation = useRevokeRole();

  const { hasPermission } = useAuthStore();
  const canUpdateUser = hasPermission("update:user");

  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/users")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <div className="text-destructive">Failed to load user details.</div>
      </div>
    );
  }

  const handleAssignRole = async () => {
    if (!selectedRoleId) return;
    try {
      await assignMutation.mutateAsync({
        userId,
        roleId: Number(selectedRoleId),
      });
      toast.success("Role assigned successfully");
      setSelectedRoleId(""); // reset
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to assign role");
    }
  };

  const handleRevokeRole = async (roleId: number) => {
    try {
      await revokeMutation.mutateAsync({
        userId,
        roleId,
      });
      toast.success("Role revoked successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to revoke role");
    }
  };

  // Filter out roles user already has for the dropdown
  const availableRoles =
    roles?.filter((r) => !user.roles.some((ur) => ur.role.id === r.id)) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/users")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="User Details"
          description={`View and manage ${user.firstName}'s account`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Personal information and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} alt={user.firstName} />
                <AvatarFallback className="text-xl">
                  {user.firstName?.charAt(0) ||
                    user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-2">
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">Phone</span>
                <p className="font-medium">{user.phone || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Joined</span>
                <p className="font-medium">
                  {user.createdAt
                    ? format(new Date(user.createdAt), "MMM d, yyyy")
                    : "Unknown"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Last Updated</span>
                <p className="font-medium">
                  {user.updatedAt
                    ? format(new Date(user.updatedAt), "MMM d, yyyy")
                    : "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles & Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles
            </CardTitle>
            <CardDescription>Manage user access and roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block">Current Roles</Label>
              {user.roles && user.roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((userRole) => (
                    <Badge
                      key={userRole.role.id}
                      variant="secondary"
                      className="px-3 py-1 flex items-center gap-1 text-sm"
                    >
                      {userRole.role.name}
                      {canUpdateUser && (
                        <button
                          onClick={() => handleRevokeRole(userRole.role.id)}
                          disabled={revokeMutation.isPending}
                          className="ml-1 rounded-full hover:bg-muted p-0.5"
                          title="Revoke Role"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No roles assigned.
                </p>
              )}
            </div>

            <PermissionGuard permission="update:user">
              <div className="space-y-3 pt-4 border-t">
                <Label>Assign New Role</Label>
                <div className="flex gap-3">
                  <Select
                    value={selectedRoleId}
                    onValueChange={setSelectedRoleId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name}
                        </SelectItem>
                      ))}
                      {availableRoles.length === 0 && (
                        <SelectItem value="none" disabled>
                          No available roles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssignRole}
                    disabled={!selectedRoleId || assignMutation.isPending}
                  >
                    {assignMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Assign
                  </Button>
                </div>
              </div>
            </PermissionGuard>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
