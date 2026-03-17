import { useMemo, useState, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ColumnDef<T> {
  header: string | ReactNode;
  accessorKey?: keyof T | string;
  cell?: (row: T) => ReactNode;
  className?: string;
  enableHiding?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = "No results found.",
}: DataTableProps<T>) {
  const allColumns = useMemo(
    () =>
      columns.map((column, index) => ({
        ...column,
        id:
          typeof column.accessorKey === "string"
            ? column.accessorKey
            : `column-${index}`,
      })),
    [columns],
  );

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        allColumns.map((column) => [column.id, column.enableHiding !== false]),
      ),
  );

  const activeColumns = allColumns.filter((column) => visibleColumns[column.id] !== false);
  const hideableColumns = allColumns.filter(
    (column) => typeof column.header === "string" && column.enableHiding !== false,
  );

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {activeColumns.map((col, i) => (
                <TableHead key={i} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={`skeleton-row-${rowIndex}`}>
                {activeColumns.map((_, colIndex) => (
                  <TableCell key={`skeleton-col-${colIndex}`}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hideableColumns.length > 0 && (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Toggle table columns"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hideableColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns[column.id] !== false}
                  onCheckedChange={(checked) =>
                    setVisibleColumns((current) => ({
                      ...current,
                      [column.id]: checked === true,
                    }))
                  }
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {activeColumns.map((col, i) => (
              <TableHead key={i} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={activeColumns.length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {activeColumns.map((col, colIndex) => (
                  <TableCell key={`col-${colIndex}`} className={col.className}>
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey
                        ? (row[col.accessorKey as keyof T] as ReactNode)
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
