import { Fragment, useMemo } from "react";

import { usePermissions } from "@/hooks/use-roles";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Permission } from "@/types/role.types";

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

function groupPermissionsBySubject(permissions: Permission[] = []) {
  const perms = Array.isArray(permissions) ? permissions : [];
  return perms.reduce<Record<string, Permission[]>>((acc, permission) => {
    const subject = permission?.subject || "unknown";
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(permission);
    return acc;
  }, {});
}

function sortSubjects(subjects: string[]) {
  const validSubjects = Array.isArray(subjects) ? subjects : [];
  return [...validSubjects].sort((left, right) => {
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

export default function PermissionsTable() {
  const { data: permissions, isLoading } = usePermissions();

  const groupedPermissions = useMemo(() => {
    const grouped = groupPermissionsBySubject(permissions);
    const sortedSubjects = sortSubjects(Object.keys(grouped));

    return sortedSubjects.map((subject) => ({
      subject,
      permissions: [...grouped[subject]].sort((left, right) => {
        const leftKey = `${left.action}:${left.subject}`;
        const rightKey = `${right.action}:${right.subject}`;
        return leftKey.localeCompare(rightKey);
      }),
    }));
  }, [permissions]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="border-b p-4">
        <h3 className="text-base font-semibold">All Available Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Read-only reference of every permission in the system.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Subject</TableHead>
            <TableHead className="w-40">Permission</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedPermissions.map(({ subject, permissions: subjectPermissions }) => (
            <Fragment key={subject}>
              <TableRow key={`${subject}-heading`} className="bg-muted/40 hover:bg-muted/40">
                <TableCell colSpan={3} className="font-semibold uppercase tracking-wider text-muted-foreground">
                  {subject}
                </TableCell>
              </TableRow>
              {subjectPermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="text-muted-foreground">{subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {permission.action}:{permission.subject}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {permission.description || `${permission.action} ${permission.subject}`}
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
