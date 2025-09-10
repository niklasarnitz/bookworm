import Image from "next/image";
import { type RouterOutputs } from "~/trpc/react";
import { formatAuthors } from "./BookTable";
import { clsx } from "clsx";
import { Check, Monitor } from "lucide-react";

// Function to generate a pseudo-random color based on book data
export function generateBookColor(bookId: string, index = 0) {
  let hash = 0;
  for (let i = 0; i < bookId.length; i++) {
    hash = bookId.charCodeAt(i) + ((hash << 5) - hash);
  }

  hash += index * 10000;

  const c = Math.abs(hash) % 360;

  return c;
}

type BookType =
  | RouterOutputs["book"]["getById"]
  | RouterOutputs["book"]["getAll"]["books"][number];

interface BookCoverProps {
  book: BookType;
  priority?: boolean;
  className?: string;
  showDetails?: boolean;
  isDetail?: boolean;
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

  const isRead = !!book.readDate;

  if (book.coverUrl) {
    return (
      <div className="relative h-full w-full">
        <Image
          src={book.coverUrl}
          alt={`Cover for ${book.name}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: "contain" }}
          className={`transition-opacity hover:opacity-80 ${className}`}
          priority={priority}
        />
        {isRead && (
          <div className="absolute top-2 right-2 rounded-full bg-green-500 p-1 text-white shadow-md">
            <Check className="h-3 w-3" />
          </div>
        )}
        {book.isEbook && (
          <div className="absolute top-2 left-2 rounded-full bg-blue-500 p-1 text-white shadow-md">
            <Monitor className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  }

  const baseHue = generateBookColor(book.id);
  const secondHue = (baseHue + 40) % 360; // Complementary color

  return (
    <div className="relative h-full w-full">
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
      {isRead && (
        <div className="absolute top-2 right-2 rounded-full bg-green-500 p-1 text-white shadow-md">
          <Check className="h-3 w-3" />
        </div>
      )}
      {book.isEbook && (
        <div className="absolute top-2 left-2 rounded-full bg-blue-500 p-1 text-white shadow-md">
          <Monitor className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}
