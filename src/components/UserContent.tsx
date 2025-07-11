import { Suspense } from "react";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { api } from "~/trpc/server";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { BookIcon, UsersIcon, LibraryIcon, FolderIcon } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { UserPageClientWrapper } from "~/components/UserPageClientWrapper";
import { UserStats } from "~/components/UserStats";

export async function UserContent({ username }: { username: string }) {
  const user = await api.userProfile.getPublicProfile({ username });

  if (!user) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={`${user.name}'s Profile`}
        description={`@${user.username} • Member since ${
          user.createdAt ? formatDistanceToNow(new Date(user.createdAt)) : "N/A"
        }`}
      >
        <div className="flex items-center gap-3">
          <UserPageClientWrapper />
        </div>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="flex items-center space-x-2 p-3">
              <BookIcon className="h-4 w-4 opacity-70" />
              <span className="text-sm font-medium">
                {user._count.books} Books
              </span>
            </Card>
            <Card className="flex items-center space-x-2 p-3">
              <UsersIcon className="h-4 w-4 opacity-70" />
              <span className="text-sm font-medium">
                {user._count.authors} Authors
              </span>
            </Card>
            <Card className="flex items-center space-x-2 p-3">
              <LibraryIcon className="h-4 w-4 opacity-70" />
              <span className="text-sm font-medium">
                {user._count.series} Series
              </span>
            </Card>
            <Card className="flex items-center space-x-2 p-3">
              <FolderIcon className="h-4 w-4 opacity-70" />
              <span className="text-sm font-medium">
                {user._count.categories} Categories
              </span>
            </Card>
          </div>

          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <UserStats username={username} />
          </Suspense>
        </CardContent>
      </Card>
    </>
  );
}
