import { Suspense } from "react";
import { TvShowDetails } from "~/components/tvShows/TvShowDetails";
import { TvShowSkeleton } from "~/components/tvShows/TvShowSkeleton";

interface TvShowDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TvShowDetailPage({
  params,
}: TvShowDetailPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<TvShowSkeleton />}>
        <TvShowDetails tvShowId={id} />
      </Suspense>
    </div>
  );
}
