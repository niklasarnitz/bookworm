import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { UserForm } from "../../../../../components/adminUsers/UserForm";

export default function NewUserPage() {
  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Create New User"
        description="Add a new user to the system"
      />

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
