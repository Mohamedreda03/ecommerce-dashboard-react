import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "@/api/roles.api";
import type { CreateRolePayload, AssignRolePayload } from "@/types/role.types";

export const roleKeys = {
  all: ["roles"] as const,
  permissions: ["permissions"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => rolesApi.getRoles(),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: roleKeys.permissions,
    queryFn: () => rolesApi.getPermissions(),
    staleTime: Infinity, // Permissions rarely change during a session
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRolePayload) => rolesApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateRolePayload>;
    }) => rolesApi.updateRole(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rolesApi.deleteRole(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  // Note: we might want to invalidate user queries here too, but passing queryClient and user key invalidation works
  return useMutation({
    mutationFn: (data: AssignRolePayload) => rolesApi.assignRole(data),
    onSuccess: (_, variables) => {
      // Typically you'd invalidate the user detail query here so the role appears UI
      queryClient.invalidateQueries({
        queryKey: ["users", "detail", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}

export function useRevokeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignRolePayload) => rolesApi.revokeRole(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["users", "detail", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}
