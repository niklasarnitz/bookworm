import { Suspense } from "react";
import { UserSkeleton } from "~/components/UserSkeleton";
import { UserContent } from "~/components/UserContent";

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<UserSkeleton />}>
        <UserContent username={username} />
      </Suspense>
    </div>
  );
}
