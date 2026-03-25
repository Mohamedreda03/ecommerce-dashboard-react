import { useState } from "react";
import { Check, MessageSquareWarning, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  useAdminDeleteReview,
  useApproveReview,
  usePendingReviews,
  useRejectReview,
} from "@/hooks/use-reviews";
import type { Review, ReviewQuery } from "@/types/review.types";
import { formatDate } from "@/lib/utils";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DataTable, { type ColumnDef } from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import FilterToolbar from "@/components/shared/FilterToolbar";
import PageHeader from "@/components/shared/PageHeader";
import PaginationBar from "@/components/shared/PaginationBar";
import PermissionGuard from "@/components/shared/PermissionGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEFAULT_QUERY: ReviewQuery = {
  page: 1,
  limit: 10,
};

function renderStars(rating: number) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${rating} star rating`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function getCommentExcerpt(comment?: string) {
  if (!comment) return "No comment provided.";
  return comment.length > 100 ? `${comment.slice(0, 100)}...` : comment;
}

export default function ReviewsPage() {
  const [query, setQuery] = useState<ReviewQuery>(DEFAULT_QUERY);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<"all" | "4plus" | "3orless">(
    "all",
  );
  const [deleteDialogReview, setDeleteDialogReview] = useState<Review | null>(
    null,
  );

  const { data: reviewsData, isLoading, isError } = usePendingReviews(query);
  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();
  const deleteMutation = useAdminDeleteReview();

  const filteredReviews = (reviewsData?.data ?? []).filter((review: Review) => {
    const matchesSearch =
      search.trim() === "" ||
      review.product.name.toLowerCase().includes(search.toLowerCase()) ||
      review.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (review.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (review.comment ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesRating =
      ratingFilter === "all" ||
      (ratingFilter === "4plus" ? review.rating >= 4 : review.rating <= 3);

    return matchesSearch && matchesRating;
  });

  const handleApprove = async (review: Review) => {
    try {
      await approveMutation.mutateAsync(review.id);
      toast.success("Review approved successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve review");
    }
  };

  const handleReject = async (review: Review) => {
    try {
      await rejectMutation.mutateAsync(review.id);
      toast.success("Review rejected successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject review");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogReview) return;

    try {
      await deleteMutation.mutateAsync(deleteDialogReview.id);
      toast.success("Review deleted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete review");
    } finally {
      setDeleteDialogReview(null);
    }
  };

  const columns: ColumnDef<Review>[] = [
    {
      header: "ENTITY",
      cell: (review) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold tracking-tight text-on-surface">
            {review.product.name}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/30">
            RECORD #{review.product.id}
          </span>
        </div>
      ),
    },
    {
      header: "ORIGIN ACTOR",
      cell: (review) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold tracking-tight text-on-surface/70">
            {review.user.firstName} {review.user.lastName}
          </span>
          <span className="text-[10px] font-medium text-on-surface/30 uppercase tracking-wide">
            {review.user.email}
          </span>
        </div>
      ),
    },
    {
      header: "SENTIMENT MAGNITUDE",
      cell: (review) => (
        <div className="flex flex-col gap-1.5">
          {renderStars(review.rating)}
          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface/20">
            QUANTUM: {review.rating}.0 / 5.0
          </span>
        </div>
      ),
    },
    {
      header: "FEEDBACK BODY",
      className: "max-w-md",
      cell: (review) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-black tracking-tight text-on-surface uppercase">
            {review.title || "VOID TITLE"}
          </span>
          <p className="text-[11px] leading-relaxed text-on-surface/50 font-medium italic">
            "{getCommentExcerpt(review.comment)}"
          </p>
        </div>
      ),
    },
    {
      header: "TEMPORAL NODE",
      cell: (review) => (
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/30">
          {formatDate(review.createdAt)}
        </span>
      ),
    },
    {
      header: "AUTHORITY",
      className: "w-48 text-right",
      cell: (review) => (
        <div className="flex justify-end gap-2">
          <PermissionGuard permission="update:review">
            <Button
              size="sm"
              onClick={() => handleApprove(review)}
              disabled={approveMutation.isPending}
              className="h-8 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border-none text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <Check className="mr-1.5 h-3 w-3" />
              Authorize
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="update:review">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleReject(review)}
              disabled={rejectMutation.isPending}
              className="h-8 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <X className="mr-1.5 h-3 w-3" />
              Discard
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="delete:review">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteDialogReview(review)}
              disabled={deleteMutation.isPending}
              className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-10 p-4 sm:p-8">
      <PageHeader
        title="Reputation Governance"
        description="Moderate clinical feedback vectors before storefront integration."
      />

      <div className="flex flex-col gap-8">
        <FilterToolbar className="md:grid-cols-2 lg:grid-cols-3 items-end gap-6 overflow-visible">
          <div className="lg:col-span-2">
            <label
              htmlFor="review-search"
              className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-2 block ml-1"
            >
              Search Index
            </label>
            <div className="relative group">
              <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface/20 group-focus-within:text-primary transition-colors" />
              <Input
                id="review-search"
                placeholder="Query entity, actor, or feedback content..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10 h-10 border-none bg-on-surface/5 rounded-xl text-xs font-medium placeholder:text-on-surface/20 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="review-rating"
              className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-2 block ml-1"
            >
              Sentiment Spectrum
            </label>
            <select
              id="review-rating"
              className="flex h-10 w-full rounded-xl border-none bg-on-surface/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider outline-none transition-all focus:ring-2 focus:ring-primary/20"
              value={ratingFilter}
              onChange={(event) =>
                setRatingFilter(
                  event.target.value as "all" | "4plus" | "3orless",
                )
              }
            >
              <option value="all">Full Spectrum</option>
              <option value="4plus">High Fidelity (4+ Stars)</option>
              <option value="3orless">Low Fidelity (3- Stars)</option>
            </select>
          </div>
        </FilterToolbar>

        {isError ? (
          <div className="rounded-3xl bg-destructive/10 p-8 text-center text-destructive">
            <p className="text-sm font-bold uppercase tracking-widest">
              Protocol error
            </p>
            <p className="text-[10px] font-medium mt-1">
              Failed to synchronize with reputation records.
            </p>
          </div>
        ) : !isLoading && (reviewsData?.data.length ?? 0) === 0 ? (
          <div className="surface-layer-1 rounded-[3rem] p-12 sm:p-20">
            <EmptyState
              icon={
                <div className="h-16 w-16 rounded-[2rem] bg-on-surface/5 flex items-center justify-center mb-6">
                  <MessageSquareWarning className="h-8 w-8 text-on-surface/20" />
                </div>
              }
              title="Equilibrium Reached"
              message="All feedback vectors have been processed through the authority layer."
            />
          </div>
        ) : (
          <div className="surface-layer-1 p-2 sm:p-4 rounded-[2.5rem] overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredReviews}
              isLoading={isLoading}
              emptyMessage="No feedback vectors detected within query scope."
            />
          </div>
        )}

        {reviewsData?.meta && (
          <div className="flex justify-center pt-4">
            <PaginationBar
              meta={reviewsData.meta}
              onPageChange={(page) =>
                setQuery((current) => ({ ...current, page }))
              }
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteDialogReview}
        onOpenChange={(open) => !open && setDeleteDialogReview(null)}
        title="Purge Feedback Node"
        description={`Are you sure you want to annihilate "${deleteDialogReview?.title || "this feedback node"}"? This action is irreversible.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
