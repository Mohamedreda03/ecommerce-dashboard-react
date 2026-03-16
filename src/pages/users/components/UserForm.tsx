import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useRoles } from "@/hooks/use-roles";
import { useCreateUser, useUpdateUser } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserSafe } from "@/types/user.types";

const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().optional(),
  roleId: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
});

export type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: UserSafe | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const isEditing = !!user;

  const { data: roles, isLoading: rolesLoading } = useRoles();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      isActive: true,
      roleId: undefined,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        isActive: user.isActive ?? true,
        // Optional: Preselect their first role if they have one
        roleId: user.roles?.[0]?.role?.id,
      });
    } else {
      reset({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        isActive: true,
        roleId: undefined,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      if (isEditing && user) {
        // Strip password if empty for edit
        const payload = { ...data };
        if (!payload.password) {
          delete payload.password;
        }
        await updateMutation.mutateAsync({ id: user.id, data: payload });
        toast.success("User updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("User created successfully");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      )}

      {isEditing && (
        <div className="space-y-2">
          <Label htmlFor="password">
            New Password (leave blank to keep current)
          </Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-sm text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-sm text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register("phone")} />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="roleId">Role</Label>
        <Select
          value={watch("roleId") ? String(watch("roleId")) : undefined}
          onValueChange={(val) => setValue("roleId", Number(val))}
          disabled={rolesLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {roles?.map((role) => (
              <SelectItem key={role.id} value={String(role.id)}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.roleId && (
          <p className="text-sm text-destructive">{errors.roleId.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="isActive"
          checked={watch("isActive")}
          onCheckedChange={(val) => setValue("isActive", val)}
        />
        <Label htmlFor="isActive">Active Account</Label>
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
          {isEditing ? "Save Changes" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
