import { Suspense } from "react";
import { api } from "~/trpc/server";
import { auth } from "~/server/auth";
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
import { ProfileClientWrapper } from "~/components/ProfileClientWrapper";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to view your profile
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container p-8">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}

function ProfileSkeleton() {
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

async function ProfileContent() {
  const profile = await api.userProfile.getProfile();

  if (!profile) {
    return <ProfileSkeleton />;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              {profile.name}&apos;s Profile
            </CardTitle>
            <CardDescription>
              @{profile.username} • Member since{" "}
              {profile.createdAt
                ? formatDistanceToNow(new Date(profile.createdAt))
                : "N/A"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6 flex flex-wrap gap-4">
          <Card className="flex items-center space-x-2 p-3">
            <BookIcon className="h-4 w-4 opacity-70" />
            <span className="text-sm font-medium">
              {profile._count.books} Books
            </span>
          </Card>
          <Card className="flex items-center space-x-2 p-3">
            <UsersIcon className="h-4 w-4 opacity-70" />
            <span className="text-sm font-medium">
              {profile._count.authors} Authors
            </span>
          </Card>
          <Card className="flex items-center space-x-2 p-3">
            <LibraryIcon className="h-4 w-4 opacity-70" />
            <span className="text-sm font-medium">
              {profile._count.series} Series
            </span>
          </Card>
          <Card className="flex items-center space-x-2 p-3">
            <FolderIcon className="h-4 w-4 opacity-70" />
            <span className="text-sm font-medium">
              {profile._count.categories} Categories
            </span>
          </Card>
        </div>

        <ProfileClientWrapper profile={profile} />
      </CardContent>
    </Card>
  );
}
