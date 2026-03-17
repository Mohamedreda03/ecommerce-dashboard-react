import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { usePermissions, useCreateRole, useUpdateRole } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { Permission, Role } from "@/types/role.types";

const SUBJECT_ORDER = [
  "product",
  "category",
  "order",
  "user",
  "role",
  "review",
  "coupon",
  "analytics",
  "all",
] as const;

const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  description: z.string().trim().optional(),
  permissionIds: z.array(z.number()),
});

export type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  role?: Role | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function groupPermissionsBySubject(permissions: Permission[] = []) {
  return permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
    if (!acc[permission.subject]) {
      acc[permission.subject] = [];
    }
    acc[permission.subject].push(permission);
    return acc;
  }, {});
}

function sortSubjects(subjects: string[]) {
  return [...subjects].sort((left, right) => {
    const leftIndex = SUBJECT_ORDER.indexOf(left as (typeof SUBJECT_ORDER)[number]);
    const rightIndex = SUBJECT_ORDER.indexOf(right as (typeof SUBJECT_ORDER)[number]);
    const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const normalizedRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

    if (normalizedLeft !== normalizedRight) {
      return normalizedLeft - normalizedRight;
    }

    return left.localeCompare(right);
  });
}

function formatPermissionLabel(permission: Permission) {
  return `${permission.action}:${permission.subject}`;
}

export default function RoleForm({ role, onSuccess, onCancel }: RoleFormProps) {
  const isEditing = !!role;

  const { data: permissions, isLoading: permissionsLoading } = usePermissions();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const existingPermissionIds = useMemo(
    () => role?.permissions.map((rolePermission) => rolePermission.permission.id) ?? [],
    [role],
  );

  const groupedPermissions = useMemo(() => {
    const grouped = groupPermissionsBySubject(permissions);
    const sortedSubjects = sortSubjects(Object.keys(grouped));

    return sortedSubjects.map((subject) => ({
      subject,
      permissions: [...grouped[subject]].sort((left, right) =>
        formatPermissionLabel(left).localeCompare(formatPermissionLabel(right)),
      ),
    }));
  }, [permissions]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
    },
  });

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description ?? "",
        permissionIds: existingPermissionIds,
      });
      return;
    }

    reset({
      name: "",
      description: "",
      permissionIds: [],
    });
  }, [role, reset, existingPermissionIds]);

  const onSubmit = async (data: RoleFormValues) => {
    const payload = {
      ...data,
      description: data.description?.trim() || undefined,
    };

    try {
      if (isEditing && role) {
        await updateMutation.mutateAsync({ id: role.id, data: payload });
        toast.success("Role updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Role created successfully");
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="role-name">Role Name</Label>
        <Input id="role-name" {...register("name")} placeholder="e.g. Editor" />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role-description">Description</Label>
        <Input
          id="role-description"
          {...register("description")}
          placeholder="Brief description of this role"
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Permissions</Label>
          <p className="text-sm text-muted-foreground">
            Select the permissions that should be assigned to this role.
          </p>
        </div>

        {permissionsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading permissions...
          </div>
        ) : groupedPermissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No permissions are available right now.
          </p>
        ) : (
          <Controller
            control={control}
            name="permissionIds"
            render={({ field }) => (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {groupedPermissions.map(({ subject, permissions: subjectPermissions }) => (
                  <fieldset key={subject} className="space-y-3">
                    <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {subject}
                    </legend>
                    <div className="grid grid-cols-1 gap-2 pl-2">
                      {subjectPermissions.map((permission) => {
                        const checkboxId = `perm-${permission.id}`;
                        const checked = field.value.includes(permission.id);

                        return (
                          <div
                            key={permission.id}
                            className="flex items-start gap-3 rounded-md border p-3"
                          >
                            <Checkbox
                              id={checkboxId}
                              checked={checked}
                              onCheckedChange={(checkedValue) => {
                                if (checkedValue) {
                                  field.onChange(
                                    field.value.includes(permission.id)
                                      ? field.value
                                      : [...field.value, permission.id],
                                  );
                                  return;
                                }

                                field.onChange(
                                  field.value.filter((id) => id !== permission.id),
                                );
                              }}
                            />
                            <label
                              htmlFor={checkboxId}
                              className="grid cursor-pointer gap-1 text-sm"
                            >
                              <span className="font-medium">
                                {formatPermissionLabel(permission)}
                              </span>
                              <span className="text-muted-foreground">
                                {permission.description || "No description provided."}
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
          />
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Role"}
        </Button>
      </div>
    </form>
  );
}
