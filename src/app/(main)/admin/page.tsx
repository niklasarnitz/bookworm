import Link from "next/link";
import { PageHeader } from "~/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Admin Dashboard"
        description="Manage system settings and users"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage system users and their roles
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground text-sm">
              Create, edit, and delete users. Assign admin privileges to users
              who need to manage the system.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/users" className="text-primary hover:underline">
              Manage Users →
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
