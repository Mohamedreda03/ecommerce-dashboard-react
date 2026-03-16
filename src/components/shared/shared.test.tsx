import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import DataTable from "./DataTable";
import ConfirmDialog from "./ConfirmDialog";
import StatusBadge from "./StatusBadge";
import PaginationBar from "./PaginationBar";
import EmptyState from "./EmptyState";
import PermissionGuard from "./PermissionGuard";
import { renderWithProviders } from "@/test/utils";

describe("Phase 7: Shared Components", () => {
  describe("PermissionGuard (shared)", () => {
    it("renders children when hasPermission is true", () => {
      renderWithProviders(
        <PermissionGuard permission="create:user">
          <button>Protected Button</button>
        </PermissionGuard>,
        { user: { id: 1 }, permissions: ["create:user"] },
      );
      expect(screen.getByText("Protected Button")).toBeInTheDocument();
    });

    it("renders nothing when hasPermission is false", () => {
      renderWithProviders(
        <PermissionGuard permission="create:user">
          <button>Protected Button</button>
        </PermissionGuard>,
        { user: { id: 1 }, permissions: ["read:user"] },
      );
      expect(screen.queryByText("Protected Button")).not.toBeInTheDocument();
    });
  });

  describe("DataTable", () => {
    const cols = [{ header: "Name", accessorKey: "name" }];
    const data = [{ name: "Item 1" }, { name: "Item 2" }];

    it("renders the correct number of <tr> rows matching the data prop length", () => {
      render(<DataTable columns={cols} data={data} />);
      // 1 header row + 2 data rows
      expect(screen.getAllByRole("row")).toHaveLength(3);
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });

    it("renders skeleton rows when isLoading=true", () => {
      const { container } = render(
        <DataTable columns={cols} data={data} isLoading />,
      );
      // 1 header row + 5 skeleton rows
      expect(screen.getAllByRole("row")).toHaveLength(6);

      // Look for Skeleton elements. Shadcn skeletons usually have a class "animate-pulse" or similar
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("ConfirmDialog", () => {
    it("calls onConfirm on confirm click and stays disabled when isLoading=true", () => {
      const onConfirm = vi.fn();
      const { rerender } = render(
        <ConfirmDialog
          title="Are you sure?"
          description="This action cannot be undone."
          onConfirm={onConfirm}
          trigger={<button>Delete</button>}
          isLoading={false}
        />,
      );

      // Open dialog
      fireEvent.click(screen.getByText("Delete"));

      // Dialog should be visible
      expect(screen.getByText("Are you sure?")).toBeInTheDocument();

      // Click confirm
      const confirmButton = screen.getByText("Confirm");
      fireEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalled();

      // Rerender as loading
      rerender(
        <ConfirmDialog
          title="Are you sure?"
          description="This action cannot be undone."
          onConfirm={onConfirm}
          trigger={<button>Delete</button>}
          isLoading={true}
        />,
      );

      // Confirming should change name to Confirming... and be disabled
      const loadingButton = screen.getByText("Confirming...");
      expect(loadingButton).toBeDisabled();
    });
  });

  describe("StatusBadge", () => {
    it("uses appropriate variant classes for DELIVERED and CANCELLED", () => {
      const { container: containerDelivered } = render(
        <StatusBadge status="DELIVERED" />,
      );
      const badgeDelivered = containerDelivered.querySelector(".bg-green-500");
      expect(badgeDelivered).toBeInTheDocument();

      const { container: containerCancelled } = render(
        <StatusBadge status="CANCELLED" />,
      );
      const badgeCancelled = containerCancelled.querySelector(".bg-red-500");
      expect(badgeCancelled).toBeInTheDocument();
    });
  });

  describe("PaginationBar", () => {
    it("disables Previous button on page 1 and Next button on last page, and fires onPageChange", () => {
      const onPageChange = vi.fn();
      const meta = {
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
        hasNextPage: true,
        hasPreviousPage: false,
      };

      const { rerender } = render(
        <PaginationBar meta={meta} onPageChange={onPageChange} />,
      );

      const prevButton = screen.getByText("Previous").closest("button");
      const nextButton = screen.getByText("Next").closest("button");

      expect(prevButton).toBeDisabled();
      expect(nextButton).not.toBeDisabled();

      fireEvent.click(nextButton!);
      expect(onPageChange).toHaveBeenCalledWith(2);

      const lastPageMeta = {
        ...meta,
        page: 10,
        hasNextPage: false,
        hasPreviousPage: true,
      };
      rerender(
        <PaginationBar meta={lastPageMeta} onPageChange={onPageChange} />,
      );

      expect(screen.getByText("Previous").closest("button")).not.toBeDisabled();
      expect(screen.getByText("Next").closest("button")).toBeDisabled();
    });
  });

  describe("EmptyState", () => {
    it("renders the provided message prop text", () => {
      render(<EmptyState message="No products found in this category" />);
      expect(
        screen.getByText("No products found in this category"),
      ).toBeInTheDocument();
    });
  });
});
