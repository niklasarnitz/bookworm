import { BookDetail } from "~/app/(main)/books/[id]/_components/BookDetail";
import { api } from "~/trpc/server";
import { PageHeader } from "~/components/ui/page-header";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const book = await api.book.getById({ id });
  const { authors } = await api.author.getAll();
  const { series } = await api.series.getAll();

  if (!book) {
    return (
      <div className="container mx-auto p-4">
        <PageHeader title="Book not found" />
        <div className="flex h-64 flex-col items-center justify-center">
          <p className="text-muted-foreground">
            The requested book could not be found
          </p>
        </div>
      </div>
    );
  }

  return <BookDetail book={book} authors={authors} series={series} />;
}
