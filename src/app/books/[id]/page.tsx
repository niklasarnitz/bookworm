import { BookDetail } from "~/app/books/[id]/_components/BookDetail";
import { api } from "~/trpc/server";

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
      <div className="flex h-64 flex-col items-center justify-center">
        <h2 className="mb-4 text-xl font-semibold">Book not found</h2>
      </div>
    );
  }

  return <BookDetail book={book} authors={authors} series={series} />;
}
