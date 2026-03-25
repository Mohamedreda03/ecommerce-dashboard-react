import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, GripVertical, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  useAddImages,
  useCreateProduct,
  useProductAdmin,
  useRemoveImage,
  useReorderImages,
  useUpdateProduct,
} from "@/hooks/use-products";
import { useCategoriesAdmin } from "@/hooks/use-categories";
import type { ProductImage } from "@/types/product.types";
import type { ApiError } from "@/types/api.types";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageHeader from "@/components/shared/PageHeader";
import ImageUpload from "@/components/shared/ImageUpload";

const decimalRegex = /^\d+(\.\d{1,2})?$/;

const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  categoryId: z.coerce.number().nullable().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  price: z.string().regex(decimalRegex, "Must be a valid price (e.g. 10.99)"),
  compareAtPrice: z
    .string()
    .regex(decimalRegex, "Must be a valid price")
    .optional()
    .or(z.literal("")),
  costPrice: z
    .string()
    .regex(decimalRegex, "Must be a valid price")
    .optional()
    .or(z.literal("")),
  sku: z.string().trim().min(2).max(100),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  weight: z
    .string()
    .regex(decimalRegex, "Must be a valid decimal")
    .optional()
    .or(z.literal("")),
  images: z.array(z.string()),
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormValues = z.output<typeof productSchema>;

function reorderImages(images: ProductImage[], draggedImageId: number, targetImageId: number) {
  const currentIndex = images.findIndex((image) => image.id === draggedImageId);
  const targetIndex = images.findIndex((image) => image.id === targetImageId);

  if (currentIndex === -1 || targetIndex === -1 || currentIndex === targetIndex) {
    return images;
  }

  const nextImages = [...images];
  const [movedImage] = nextImages.splice(currentIndex, 1);
  nextImages.splice(targetIndex, 0, movedImage);
  return nextImages;
}

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== "new";
  const productId = isEditing ? Number(id) : undefined;
  const navigate = useNavigate();

  const { data: product, isLoading: productLoading } = useProductAdmin(productId);
  const { data: categories, isLoading: categoriesLoading } = useCategoriesAdmin();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const addImagesMutation = useAddImages();
  const reorderImagesMutation = useReorderImages();
  const removeImageMutation = useRemoveImage();

  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [draggedImageId, setDraggedImageId] = useState<number | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      categoryId: null,
      isActive: true,
      isFeatured: false,
      price: "",
      compareAtPrice: "",
      costPrice: "",
      sku: "",
      stock: 0,
      lowStockThreshold: 5,
      weight: "",
      images: [],
    },
  });

  useEffect(() => {
    if (!product || !isEditing) return;

    reset({
      name: product.name,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      categoryId: product.categoryId ?? null,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      price: product.price,
      compareAtPrice: product.compareAtPrice || "",
      costPrice: product.costPrice || "",
      sku: product.sku,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      weight: product.weight || "",
      images: [],
    });

    const productImages = product.images ?? [];
    if (JSON.stringify(existingImages) !== JSON.stringify(productImages)) {
      setExistingImages(productImages);
    }
  }, [isEditing, product, reset, existingImages]);

  const handleRemoveExistingImage = async (image: ProductImage) => {
    if (!productId) return;

    try {
      await removeImageMutation.mutateAsync({ productId, imageId: image.id });
      setExistingImages((current) => current.filter((entry) => entry.id !== image.id));
      toast.success("Image removed successfully");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to remove image");
    }
  };

  const handleReorderExistingImages = async (targetImageId: number) => {
    if (!productId || draggedImageId === null || draggedImageId === targetImageId) {
      setDraggedImageId(null);
      return;
    }

    const nextImages = reorderImages(existingImages, draggedImageId, targetImageId);
    setExistingImages(nextImages);
    setDraggedImageId(null);

    try {
      await reorderImagesMutation.mutateAsync({
        id: productId,
        data: { imageIds: nextImages.map((image) => image.id) },
      });
      toast.success("Image order updated");
    } catch (error) {
      setExistingImages(existingImages);
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to reorder images");
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const payload = {
        name: data.name,
        description: data.description?.trim() || undefined,
        shortDescription: data.shortDescription?.trim() || undefined,
        categoryId: data.categoryId || undefined,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        price: data.price,
        compareAtPrice: data.compareAtPrice || undefined,
        costPrice: data.costPrice || undefined,
        sku: data.sku,
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold,
        weight: data.weight || undefined,
      };

      let currentProductId = productId;

      if (isEditing && productId) {
        await updateMutation.mutateAsync({ id: productId, data: payload });
        toast.success("Product updated successfully");
      } else {
        const createdProduct = await createMutation.mutateAsync(payload);
        currentProductId = createdProduct.id;
        toast.success("Product created successfully");
      }

      if (currentProductId && data.images.length > 0) {
        await addImagesMutation.mutateAsync({
          id: currentProductId,
          data: {
            images: data.images.map((url, index) => ({
              url,
              sortOrder: existingImages.length + index,
            })),
          },
        });
      }

      navigate(`/products/${currentProductId}`);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "An error occurred");
    }
  };

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    addImagesMutation.isPending ||
    reorderImagesMutation.isPending ||
    removeImageMutation.isPending;

  if (isEditing && productLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <PageHeader
        title={isEditing ? "Edit Product" : "New Product"}
        description="Enter the details of the product below."
        action={
          <Button variant="outline" onClick={() => navigate("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic product information and visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : "none"}
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? null : Number(value))
                      }
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger id="categoryId">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                {...register("shortDescription")}
                placeholder="Brief summary for list views"
              />
              {errors.shortDescription && (
                <p className="text-sm text-destructive">
                  {errors.shortDescription.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} {...register("description")} />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                )}
              />

              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isFeatured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="isFeatured">Featured</Label>
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Define store, comparison, and cost pricing.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" placeholder="0.00" {...register("price")} />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Compare At Price</Label>
              <Input
                id="compareAtPrice"
                placeholder="0.00"
                {...register("compareAtPrice")}
              />
              {errors.compareAtPrice && (
                <p className="text-sm text-destructive">
                  {errors.compareAtPrice.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input id="costPrice" placeholder="0.00" {...register("costPrice")} />
              {errors.costPrice && (
                <p className="text-sm text-destructive">{errors.costPrice.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Configure SKU, stock, low stock threshold, and weight.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input id="weight" placeholder="1.50" {...register("weight")} />
              {errors.weight && (
                <p className="text-sm text-destructive">{errors.weight.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" min="0" {...register("stock")} />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                {...register("lowStockThreshold")}
              />
              {errors.lowStockThreshold && (
                <p className="text-sm text-destructive">
                  {errors.lowStockThreshold.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>
              Upload product images. Existing images can be dragged to reorder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing && existingImages.length > 0 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Existing Images</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag to reorder. Removing an image updates the server immediately.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {existingImages.map((image) => (
                    <div
                      key={image.id}
                      draggable
                      onDragStart={() => setDraggedImageId(image.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleReorderExistingImages(image.id)}
                      className="overflow-hidden rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between border-b px-3 py-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                          Image #{image.id}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveExistingImage(image)}
                          disabled={removeImageMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <img
                        src={image.url}
                        alt={image.alt || `Product image ${image.id}`}
                        className="aspect-square w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUpload multiple value={field.value} onChange={field.onChange} />
              )}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/products")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
