import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { UserPageClientWrapper } from "~/components/UserPageClientWrapper";
import { api } from "~/trpc/server";

export async function UserStats({ username }: { username: string }) {
  const stats = await api.userProfile.getStats({ username });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">User Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <UserPageClientWrapper stats={stats} />
      </CardContent>
    </Card>
  );
}
