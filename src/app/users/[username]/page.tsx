import { Suspense } from "react";
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { BookIcon, UsersIcon, LibraryIcon, FolderIcon } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { UserPageClientWrapper } from "~/components/UserPageClientWrapper";

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <div className="p-8">
      <Suspense fallback={<UserSkeleton />}>
        <UserContent username={username} />
      </Suspense>
    </div>
  );
}

function UserSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-2 h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

async function UserContent({ username }: { username: string }) {
  const user = await api.userProfile.getPublicProfile({ username });

  if (!user) {
    notFound();
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              {user.name}&apos;s Profile
            </CardTitle>
            <CardDescription>
              @{user.username} • Member since{" "}
              {user.createdAt
                ? formatDistanceToNow(new Date(user.createdAt))
                : "N/A"}
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <UserPageClientWrapper />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6 flex flex-wrap gap-4">
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
  );
}

async function UserStats({ username }: { username: string }) {
  const stats = await api.userProfile.getStats({ username });

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <UserPageClientWrapper stats={stats} />
      </CardContent>
    </Card>
  );
}
