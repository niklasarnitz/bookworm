import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { UserForm } from "../_components/UserForm";

export default function NewUserPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Create New User</h2>
        <p className="text-muted-foreground">Add a new user to the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm mode="create" />
        </CardContent>
      </Card>
    </>
  );
}
