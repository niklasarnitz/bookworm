import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { UserForm } from "../../../../../components/adminUsers/UserForm";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

interface UserEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { id } = await params;
  const trpc = createCaller(
    await createTRPCContext({ headers: new Headers() }),
  );

  const user = await trpc.userManagement.getById({ id });

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Edit User"
        description={`Update user details for ${user.name}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm mode="edit" user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
