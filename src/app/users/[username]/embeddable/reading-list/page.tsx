import { TRPCError } from "@trpc/server";
import { api } from "~/trpc/server";

export const metadata = {
  title: "Reading List",
};

export default async function EmbeddableReadingList({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  try {
    const readingList = await api.embeddable.getReadingList({ username });
    const user = await api.userProfile.getPublicProfile({ username });

    // No books or user doesn't share their reading list
    if (
      !readingList ||
      Object.keys(readingList).length === 0 ||
      !user.isSharingReadingList
    ) {
      return (
        <div className="p-4 text-center">
          <p className="text-gray-500">
            This reading list is not available or is empty.
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-full p-4 font-sans">
        {Object.entries(readingList).map(([year, books]) => (
          <div key={year} className="mb-8">
            <h2 className="mb-3 border-b border-gray-200 pb-1 text-xl font-bold text-gray-800">
              {year}
            </h2>
            <div className="overflow-x-auto">
              <table className="mb-6 w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b p-2 text-left font-medium text-gray-600">
                      Author
                    </th>
                    <th className="border-b p-2 text-left font-medium text-gray-600">
                      Title
                    </th>
                    <th className="border-b p-2 text-left font-medium text-gray-600">
                      Read Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {books?.map((book) => (
                    <tr
                      key={book.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="border-b border-gray-100 p-2 text-gray-800">
                        {book?.bookAuthors
                          .map((bookAuthor) => bookAuthor.author.name)
                          .join(", ")}
                      </td>
                      <td className="border-b border-gray-100 p-2 font-medium text-gray-800">
                        {book.name}
                      </td>
                      <td className="border-b border-gray-100 p-2 text-gray-500">
                        {book.readDate?.toLocaleDateString("de-DE", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <footer className="mt-6 border-t pt-3 text-center text-xs text-gray-500">
          Powered by Bookworm
        </footer>
      </div>
    );
  } catch (error) {
    console.error("Error fetching reading list:", error);
    if (error instanceof TRPCError)
      return <p className="p-4 text-red-500">Error: {error.message}</p>;
    return <p className="p-4 text-red-500">An unknown error occurred</p>;
  }
}
