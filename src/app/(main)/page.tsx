import { Suspense } from "react";
import { cookies } from "next/headers";
import { type BookSearch, type ViewMode } from "~/schemas/book";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { setBookListViewMode } from "~/server/actions/setBookListViewMode";
import { BookGrid, BookGridSkeleton } from "~/components/books/BookGrid";
import { BookTable, BookTableSkeleton } from "~/components/books/BookTable";
import { api } from "~/trpc/server";
import { Pagination } from "~/components/ui/pagination";
import { BookFormDialog } from "~/components/books/BookFormDialog";
import { BookPageBarcodeScanner } from "~/components/BookPageBarcodeScanner";
import { BookPageAddBookPopover } from "~/components/books/BookPageAddBookPopover";
import { BookFilter } from "~/components/books/BookFilter";
import { BookSort } from "~/components/books/BookSort";
import { PageHeader } from "~/components/ui/page-header";
import { BookSearch as BookSearchComponent } from "~/components/books/BookSearch";
import { Skeleton } from "~/components/ui/skeleton";

function BookFilterSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

function BookSearchSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function BookSortSkeleton() {
  return <Skeleton className="h-8 w-32" />;
}

type PageProps = {
  searchParams: Promise<{
    query?: string;
    authorId?: string;
    seriesId?: string;
    categoryId?: string;
    noCover?: boolean;
    noCategory?: boolean;
    onlyRead?: boolean;
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export default async function BooksPage({ searchParams }: Readonly<PageProps>) {
  const params = await searchParams;

  const cookieStore = await cookies();
  const viewModeCookie = cookieStore.get("bookworm-view-mode");
  const viewMode = (viewModeCookie?.value as ViewMode) || "grid";

  const pageSize = viewMode === "grid" ? 12 : 25;

  const filters: BookSearch = {
    query: params.query ?? undefined,
    authorId: params.authorId ?? undefined,
    seriesId: params.seriesId ?? undefined,
    categoryId: params.categoryId ?? undefined,
    noCover: params.noCover ? true : undefined,
    noCategory: params.noCategory ? true : undefined,
    onlyRead: params.onlyRead ? true : undefined,
    sortBy: params.sortBy as
      | "createdAt"
      | "name"
      | "author"
      | "series"
      | "readDate"
      | undefined,
    sortOrder: params.sortOrder as "asc" | "desc" | undefined,
    pagination: {
      page: params.page ? Number(params.page) : 1,
      pageSize,
    },
  };

  const { books, pagination } = await api.book.getAll(filters);
  const { authors } = await api.author.getAll();
  const { series } = await api.series.getAll();

  return (
    <div className="container mx-auto p-4">
      <PageHeader title="Books" description="Manage your book collection">
        <div className="flex items-center gap-4">
          <Tabs
            defaultValue={viewMode}
            onValueChange={setBookListViewMode}
            className="w-32"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>

          <BookPageAddBookPopover />
        </div>
      </PageHeader>

      <Suspense fallback={<BookSearchSkeleton />}>
        <div className="w-full">
          <BookSearchComponent />
        </div>
      </Suspense>

      <div className="flex items-center justify-between py-4">
        <Suspense fallback={<BookFilterSkeleton />}>
          <BookFilter />
        </Suspense>
        <Suspense fallback={<BookSortSkeleton />}>
          <BookSort />
        </Suspense>
      </div>

      <Suspense
        fallback={
          viewMode === "grid" ? <BookGridSkeleton /> : <BookTableSkeleton />
        }
      >
        {viewMode === "grid" ? (
          <BookGrid books={books} />
        ) : (
          <BookTable books={books} />
        )}
      </Suspense>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}

      <Suspense>
        <BookFormDialog authors={authors} series={series} />
      </Suspense>

      <BookPageBarcodeScanner />
    </div>
  );
}
