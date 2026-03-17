import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/use-categories";
import type { Category } from "@/types/category.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "@/components/shared/ImageUpload";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  parentId: z.coerce.number().nullable().optional(),
  image: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0, "Sort order must be 0 or greater"),
  isActive: z.boolean(),
});

type CategoryFormInput = z.input<typeof categorySchema>;
type CategoryFormValues = z.output<typeof categorySchema>;

interface CategoryOption {
  id: number;
  label: string;
}

interface CategoryFormProps {
  category?: Category | null;
  parentOptions: CategoryOption[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CategoryForm({
  category,
  parentOptions,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const isEditing = !!category;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: null,
      image: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description ?? "",
        parentId: category.parentId ?? null,
        image: category.image ?? "",
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
      return;
    }

    reset({
      name: "",
      description: "",
      parentId: null,
      image: "",
      sortOrder: 0,
      isActive: true,
    });
  }, [category, reset]);

  const onSubmit = async (data: CategoryFormValues) => {
    const payload = {
      name: data.name,
      description: data.description?.trim() || undefined,
      parentId: data.parentId ?? null,
      image: data.image?.trim() || undefined,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    };

    try {
      if (isEditing && category) {
        await updateMutation.mutateAsync({ id: category.id, data: payload });
        toast.success("Category updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Category created successfully");
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save category");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="category-name">Name</Label>
        <Input id="category-name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-description">Description</Label>
        <Textarea id="category-description" rows={4} {...register("description")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">Parent Category</Label>
        <Controller
          control={control}
          name="parentId"
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : "none"}
              onValueChange={(value) =>
                field.onChange(value === "none" ? null : Number(value))
              }
            >
              <SelectTrigger id="parentId">
                <SelectValue placeholder="No parent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent</SelectItem>
                {parentOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-image">Image URL</Label>
        <Input
          id="category-image"
          placeholder="https://example.com/image.jpg"
          {...register("image")}
        />
      </div>

      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <div className="space-y-2">
            <Label>Upload Image</Label>
            <ImageUpload
              value={field.value ? [field.value] : []}
              onChange={(urls) => field.onChange(urls[0] ?? "")}
            />
          </div>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" type="number" min="0" {...register("sortOrder")} />
          {errors.sortOrder && (
            <p className="text-sm text-destructive">{errors.sortOrder.message}</p>
          )}
        </div>

        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <div className="flex items-center gap-2 pt-8">
              <Switch
                id="isActive"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          )}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
