import { Suspense } from "react";
import { auth } from "~/server/auth";
import { PageHeader } from "~/components/ui/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ProfileSkeleton } from "~/components/profile/ProfileSkeleton";
import { ProfileContent } from "~/components/profile/ProfileContent";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto p-4">
        <PageHeader title="Profile" />

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
    <div className="container mx-auto p-4">
      <PageHeader title="Profile" />

      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
