import { Suspense } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { UserTable } from "~/app/admin/users/_components/UserTable";
import { Skeleton } from "~/components/ui/skeleton";

export default function UsersPage() {
  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="User Management"
        description="Manage system users and their roles"
      >
        <Button asChild>
          <Link href="/admin/users/new">Add New User</Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>All registered users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            }
          >
            <UserTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
