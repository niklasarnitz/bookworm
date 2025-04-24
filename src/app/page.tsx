import { Suspense } from "react";
import { cookies } from "next/headers";
import { BooksClient } from "./_components/BooksClient";
import { type ViewMode } from "~/schemas/book";

export default async function BooksPage() {
  const cookieStore = await cookies();
  const viewModeCookie = cookieStore.get("bookworm-view-mode");
  const initialViewMode = (viewModeCookie?.value as ViewMode) || "grid";

  return (
    <div className="container mx-auto p-4">
      <Suspense
        fallback={<div className="py-10 text-center">Loading books...</div>}
      >
        <BooksClient initialViewMode={initialViewMode} />
      </Suspense>
    </div>
  );
}
