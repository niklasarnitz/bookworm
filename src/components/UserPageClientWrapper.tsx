import { type RouterOutputs } from "~/trpc/react";

interface UserPageClientWrapperProps {
  stats?: RouterOutputs["userProfile"]["getStats"];
}

export function UserPageClientWrapper({
  stats,
}: Readonly<UserPageClientWrapperProps>) {
  // If stats are provided, render the stats view
  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {stats.recentBooks && stats.recentBooks.length > 0 && (
        <div>
          <h3 className="mb-2 text-lg font-medium">Recent Books</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recentBooks.map((book) => (
              <div key={book.id} className="rounded-lg border p-4">
                <h4 className="font-medium">{book.name}</h4>
                {book.bookAuthors?.length > 0 && (
                  <p className="text-muted-foreground text-sm">
                    by{" "}
                    {book.bookAuthors
                      .map((ba) => ba.author?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.topAuthors && stats.topAuthors.length > 0 && (
        <div>
          <h3 className="mb-2 text-lg font-medium">Top Authors</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.topAuthors.map((author) => (
              <div
                key={author.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <span>{author.name}</span>
                <span className="text-muted-foreground text-sm">
                  {author._count.books} books
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
