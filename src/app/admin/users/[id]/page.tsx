import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { UserForm } from "../_components/UserForm";
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

  try {
    const user = await trpc.userManagement.getById({ id });

    return (
      <>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Edit User</h2>
          <p className="text-muted-foreground">
            Update user details for {user.name}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <UserForm mode="edit" user={user} />
          </CardContent>
        </Card>
      </>
    );
  } catch (error) {
    notFound();
  }
}
