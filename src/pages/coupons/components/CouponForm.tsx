import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import * as z from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  DiscountType,
  type Coupon,
  type CreateCouponPayload,
} from "@/types/coupon.types";
import { useCreateCoupon, useUpdateCoupon } from "@/hooks/use-coupons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const decimalString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/, "Must be a valid decimal value");

const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Code is required")
      .max(50, "Code must be 50 characters or fewer"),
    discountType: z.nativeEnum(DiscountType),
    discountValue: decimalString,
    description: z.string().optional(),
    minOrderAmount: z.union([decimalString, z.literal("")]).optional(),
    maxDiscountAmount: z.union([decimalString, z.literal("")]).optional(),
    maxUses: z.union([z.coerce.number().int().min(1), z.literal("")]).optional(),
    isActive: z.boolean(),
    startsAt: z.date().nullable(),
    expiresAt: z.date().nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      data.discountType === DiscountType.PERCENTAGE &&
      data.maxDiscountAmount &&
      data.maxDiscountAmount.trim() === ""
    ) {
      return;
    }

    if (
      data.startsAt &&
      data.expiresAt &&
      data.expiresAt.getTime() < data.startsAt.getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiresAt"],
        message: "Expiry date cannot be earlier than the start date",
      });
    }
  });

type CouponFormInput = z.input<typeof couponSchema>;
type CouponFormValues = z.output<typeof couponSchema>;

interface CouponFormProps {
  coupon?: Coupon | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function toDate(value?: string | null) {
  return value ? new Date(value) : null;
}

function formatDateLabel(value: Date | null, placeholder: string) {
  return value ? format(value, "MMM d, yyyy") : placeholder;
}

export default function CouponForm({
  coupon,
  onSuccess,
  onCancel,
}: CouponFormProps) {
  const isEditing = !!coupon;
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const [startsAtOpen, setStartsAtOpen] = useState(false);
  const [expiresAtOpen, setExpiresAtOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CouponFormInput, unknown, CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discountType: DiscountType.PERCENTAGE,
      discountValue: "",
      description: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      maxUses: "",
      isActive: true,
      startsAt: null,
      expiresAt: null,
    },
  });

  const discountType = watch("discountType");
  const startsAtValue = watch("startsAt");

  useEffect(() => {
    if (coupon) {
      reset({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description ?? "",
        minOrderAmount: coupon.minOrderAmount ?? "",
        maxDiscountAmount: coupon.maxDiscountAmount ?? "",
        maxUses: coupon.maxUses ?? "",
        isActive: coupon.isActive,
        startsAt: toDate(coupon.startsAt),
        expiresAt: toDate(coupon.expiresAt),
      });
      return;
    }

    reset({
      code: "",
      discountType: DiscountType.PERCENTAGE,
      discountValue: "",
      description: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      maxUses: "",
      isActive: true,
      startsAt: null,
      expiresAt: null,
    });
  }, [coupon, reset]);

  const onSubmit = async (data: CouponFormValues) => {
    const payload: CreateCouponPayload = {
      code: data.code.trim().toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue.trim(),
      description: data.description?.trim() || undefined,
      minOrderAmount: data.minOrderAmount?.trim() || undefined,
      maxDiscountAmount:
        data.discountType === DiscountType.PERCENTAGE
          ? data.maxDiscountAmount?.trim() || undefined
          : undefined,
      maxUses: data.maxUses === "" ? undefined : data.maxUses,
      isActive: data.isActive,
      startsAt: data.startsAt ? data.startsAt.toISOString() : undefined,
      expiresAt: data.expiresAt ? data.expiresAt.toISOString() : undefined,
    };

    try {
      if (coupon) {
        await updateMutation.mutateAsync({ id: coupon.id, data: payload });
        toast.success("Coupon updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Coupon created successfully");
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save coupon");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="coupon-code">Code</Label>
          <Input
            id="coupon-code"
            {...register("code")}
            onChange={(event) => setValue("code", event.target.value.toUpperCase())}
          />
          {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
        </div>

        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <div className="flex items-center gap-2 pt-8">
              <Switch id="coupon-is-active" checked={field.value} onCheckedChange={field.onChange} />
              <Label htmlFor="coupon-is-active">Active</Label>
            </div>
          )}
        />
      </div>

      <div className="space-y-3">
        <Label>Discount Type</Label>
        <Controller
          control={control}
          name="discountType"
          render={({ field }) => (
            <div className="grid gap-3 md:grid-cols-2">
              {[DiscountType.PERCENTAGE, DiscountType.FIXED_AMOUNT].map((value) => (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm",
                    field.value === value && "border-primary bg-primary/5",
                  )}
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={value}
                    checked={field.value === value}
                    onChange={() => field.onChange(value)}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="discount-value">Discount Value</Label>
          <Input id="discount-value" {...register("discountValue")} />
          {errors.discountValue && (
            <p className="text-sm text-destructive">{errors.discountValue.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="min-order-amount">Minimum Order Amount</Label>
          <Input id="min-order-amount" {...register("minOrderAmount")} />
        </div>
      </div>

      {discountType === DiscountType.PERCENTAGE && (
        <div className="space-y-2">
          <Label htmlFor="max-discount-amount">Maximum Discount Amount</Label>
          <Input id="max-discount-amount" {...register("maxDiscountAmount")} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="max-uses">Maximum Uses</Label>
          <Input id="max-uses" type="number" min="1" {...register("maxUses")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coupon-description">Description</Label>
          <Textarea id="coupon-description" rows={3} {...register("description")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="startsAt"
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Starts At</Label>
              <Popover open={startsAtOpen} onOpenChange={setStartsAtOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-start font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateLabel(field.value, "Select start date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined}
                    onSelect={(date) => {
                      field.onChange(date ?? null);
                      setStartsAtOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        />

        <Controller
          control={control}
          name="expiresAt"
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Expires At</Label>
              <Popover open={expiresAtOpen} onOpenChange={setExpiresAtOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-start font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateLabel(field.value, "Select expiry date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined}
                    disabled={(date) =>
                      startsAtValue ? date < startsAtValue : false
                    }
                    onSelect={(date) => {
                      field.onChange(date ?? null);
                      setExpiresAtOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.expiresAt && (
                <p className="text-sm text-destructive">{errors.expiresAt.message}</p>
              )}
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
          {isEditing ? "Save Changes" : "Create Coupon"}
        </Button>
      </div>
    </form>
  );
}
