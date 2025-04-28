import Image from "next/image";
import { type RouterOutputs } from "~/trpc/react";
import { formatAuthors } from "./BookTable";
import { clsx } from "clsx";

// Function to generate a pseudo-random color based on book data
export function generateBookColor(bookId: string, index = 0) {
  // Use the book ID and optional index to create a deterministic but seemingly random color
  let hash = 0;
  for (let i = 0; i < bookId.length; i++) {
    hash = bookId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Add the index to get different colors for different elements
  hash += index * 10000;

  // Convert to hex
  const c = Math.abs(hash) % 360;

  // Return a hue value, we'll use HSL to create variations
  return c;
}

type BookType =
  | RouterOutputs["book"]["getById"]
  | RouterOutputs["book"]["getAll"][0];

interface BookCoverProps {
  book: BookType;
  priority?: boolean;
  className?: string;
  showDetails?: boolean;
  isDetail?: boolean; // New prop to indicate if this is in detail view
}

export function BookCover({
  book,
  priority = false,
  className = "",
  showDetails = true,
  isDetail = false,
}: Readonly<BookCoverProps>) {
  if (!book) {
    return null;
  }

  if (book.coverUrl) {
    return (
      <Image
        src={book.coverUrl}
        alt={`Cover for ${book.name}`}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        style={{ objectFit: "contain" }}
        className={`transition-opacity hover:opacity-80 ${className}`}
        priority={priority}
      />
    );
  }

  // Generate base colors using the book ID
  const baseHue = generateBookColor(book.id);
  const secondHue = (baseHue + 40) % 360; // Complementary color

  return (
    <div
      className={`mx-auto my-auto flex aspect-[3/4] h-full max-w-[75%] overflow-hidden rounded bg-gradient-to-br from-[hsl(var(--hue),70%,80%)] to-[hsl(var(--secondary-hue),60%,60%)] shadow-md dark:from-[hsl(var(--hue),60%,30%)] dark:to-[hsl(var(--secondary-hue),50%,20%)] ${className}`}
      style={
        {
          "--hue": `${baseHue}deg`,
          "--secondary-hue": `${secondHue}deg`,
        } as React.CSSProperties
      }
    >
      {showDetails && (
        <div className="flex h-full w-full flex-col items-center justify-between p-4 text-center">
          <div className={clsx("flex-1", isDetail ? "mt-4" : "mt-2")}>
            <h3
              className={clsx(
                "text-foreground line-clamp-3 font-bold",
                isDetail ? "mb-3 text-xl" : "mb-2 text-lg",
              )}
            >
              {book.name}
            </h3>

            {book.subtitle && (
              <p
                className={clsx(
                  "text-muted-foreground line-clamp-2",
                  isDetail ? "mb-4 text-base" : "mb-3 text-sm",
                )}
              >
                {book.subtitle}
              </p>
            )}

            {book.series && (
              <p
                className={clsx(
                  "text-muted-foreground line-clamp-3 italic",
                  isDetail ? "mb-2 text-base" : "mb-1 text-sm",
                )}
              >
                {book.series.name}
                {book.seriesNumber !== null && ` #${book.seriesNumber}`}
              </p>
            )}
          </div>

          <div className={clsx("w-full", isDetail ? "mb-4" : "mb-2")}>
            <p
              className={clsx(
                "text-muted-foreground line-clamp-3",
                isDetail ? "text-sm" : "text-xs",
              )}
            >
              {formatAuthors(book.bookAuthors)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
