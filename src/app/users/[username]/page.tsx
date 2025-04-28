"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { BookIcon, UsersIcon, LibraryIcon, FolderIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { api } from "~/trpc/react";
import UserStats from "~/components/profile/UserStats";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";

export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { data: session } = useSession();
  const isOwnProfile = session?.user?.username === username;

  // Get public profile view
  const {
    data: user,
    isLoading: userLoading,
    error,
  } = api.userProfile.getPublicProfile.useQuery(
    { username },
    { enabled: !!username },
  );

  // Get user stats
  const { data: stats, isLoading: statsLoading } =
    api.userProfile.getStats.useQuery({ username }, { enabled: !!username });

  // Handle errors or unauthorized access
  if (error) {
    if (error.data?.code === "NOT_FOUND") {
      return (
        <div className="container py-8">
          <Card className="mx-auto w-full max-w-lg">
            <CardHeader>
              <CardTitle>User Not Found</CardTitle>
              <CardDescription>
                The user profile you&apos;re looking for doesn&apos;t exist or
                has been removed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.back()}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="container py-8">
        <Card className="mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error.message || "An error occurred while loading this profile."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userLoading || !user) {
    return (
      <div className="container py-8">
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
      </div>
    );
  }

  return (
    <div className="p-8">
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
                  ? formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                    })
                  : "N/A"}
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>
                {user.role}
              </Badge>

              {isOwnProfile && (
                <Button onClick={() => router.push("/profile")}>
                  Edit Your Profile
                </Button>
              )}
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

          <UserStats data={stats} isLoading={statsLoading} userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
