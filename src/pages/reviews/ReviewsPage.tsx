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
    <div className="flex items-center gap-1" aria-label={`${rating} star rating`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
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
  const [ratingFilter, setRatingFilter] = useState<"all" | "4plus" | "3orless">("all");
  const [deleteDialogReview, setDeleteDialogReview] = useState<Review | null>(null);

  const { data: reviewsData, isLoading, isError } = usePendingReviews(query);
  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();
  const deleteMutation = useAdminDeleteReview();

  const filteredReviews = (reviewsData?.data ?? []).filter((review) => {
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
      header: "Product",
      cell: (review) => <span className="font-medium">{review.product.name}</span>,
    },
    {
      header: "Reviewer",
      cell: (review) => review.user.email,
    },
    {
      header: "Rating",
      cell: (review) => renderStars(review.rating),
    },
    {
      header: "Title",
      cell: (review) => review.title || "Untitled review",
    },
    {
      header: "Comment",
      cell: (review) => (
        <span className="text-sm text-muted-foreground">{getCommentExcerpt(review.comment)}</span>
      ),
    },
    {
      header: "Created",
      cell: (review) => formatDate(review.createdAt),
    },
    {
      header: "Actions",
      className: "w-60",
      cell: (review) => (
        <div className="flex gap-2">
          <PermissionGuard permission="update:review">
            <Button
              size="sm"
              onClick={() => handleApprove(review)}
              disabled={approveMutation.isPending}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="update:review">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReject(review)}
              disabled={rejectMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="delete:review">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteDialogReview(review)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Moderate pending customer reviews before they appear on the storefront."
      />

      <FilterToolbar className="md:grid-cols-2">
        <Input
          placeholder="Search product, reviewer, or content..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          aria-label="Review rating"
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={ratingFilter}
          onChange={(event) =>
            setRatingFilter(event.target.value as "all" | "4plus" | "3orless")
          }
        >
          <option value="all">All ratings</option>
          <option value="4plus">4 stars and up</option>
          <option value="3orless">3 stars and below</option>
        </select>
      </FilterToolbar>

      {isError ? (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          Failed to load pending reviews. Please try again later.
        </div>
      ) : !isLoading && (reviewsData?.data.length ?? 0) === 0 ? (
        <EmptyState
          icon={<MessageSquareWarning className="h-10 w-10 text-muted-foreground" />}
          title="No Pending Reviews"
          message="All pending reviews have already been moderated."
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredReviews}
          isLoading={isLoading}
          emptyMessage="No pending reviews found."
        />
      )}

      {reviewsData?.meta && (
        <PaginationBar
          meta={reviewsData.meta}
          onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
        />
      )}

      <ConfirmDialog
        open={!!deleteDialogReview}
        onOpenChange={(open) => !open && setDeleteDialogReview(null)}
        title="Delete Review"
        description={`Are you sure you want to permanently delete "${deleteDialogReview?.title || "this review"}"?`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
