"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { BookIcon, UsersIcon, LibraryIcon, FolderIcon } from "lucide-react";

import { api } from "~/trpc/react";
import ProfileForm from "~/components/profile/ProfileForm";
import PasswordChangeForm from "~/components/profile/PasswordChangeForm";
import UserStats from "~/components/profile/UserStats";
import { Skeleton } from "~/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: profile, isLoading: profileLoading } =
    api.userProfile.getProfile.useQuery();
  const { data: stats, isLoading: statsLoading } =
    api.userProfile.getStats.useQuery(
      { username: session?.user?.username ?? "" },
      { enabled: !!session?.user?.id },
    );

  if (profileLoading || !profile) {
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
    <div className="container py-8">
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
                  ? formatDistanceToNow(new Date(profile.createdAt), {
                      addSuffix: true,
                    })
                  : "N/A"}
              </CardDescription>
            </div>

            <Badge variant={profile.role === "ADMIN" ? "default" : "outline"}>
              {profile.role}
            </Badge>
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

          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="edit">Edit Profile</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <UserStats
                data={stats}
                isLoading={statsLoading}
                userId={profile.id}
              />
            </TabsContent>

            <TabsContent value="edit" className="mt-6">
              <ProfileForm profile={profile} />
            </TabsContent>

            <TabsContent value="password" className="mt-6">
              <PasswordChangeForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
