import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { z } from "zod";

// Define a schema for cover data returned from the API
const AmazonCoverSchema = z.object({
  title: z.string(),
  author: z.string(),
  coverUrl: z.string().url(),
});

// Type for cover data
type AmazonCover = z.infer<typeof AmazonCoverSchema>;

// Type for the API response
interface AmazonCoverResponse {
  success: boolean;
  covers?: AmazonCover[];
  error?: string;
}

interface AmazonCoverFetcherProps {
  isbn: string | null | undefined;
  onCoverSelect: (coverUrl: string) => void;
  onClose: () => void;
}

export function AmazonCoverFetcher({
  isbn,
  onCoverSelect,
  onClose,
}: Readonly<AmazonCoverFetcherProps>) {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Use tRPC query for fetching covers
  const coversQuery = api.amazon.getCoverByIsbn.useQuery(
    { isbn: isbn ?? "" },
    {
      enabled: !!isbn,
      retry: false,
    },
  );

  // Validate the response data with our schema
  const validateCovers = (data: unknown): AmazonCover[] => {
    if (!data || typeof data !== "object" || !("covers" in data)) {
      return [];
    }

    // Cast to the response type and check for covers
    const response = data as AmazonCoverResponse;

    if (
      !response.success ||
      !response.covers ||
      !Array.isArray(response.covers)
    ) {
      return [];
    }

    // Validate each cover
    return response.covers.filter((cover): cover is AmazonCover => {
      const result = AmazonCoverSchema.safeParse(cover);
      return result.success;
    });
  };

  // Get type-safe covers
  const covers = validateCovers(coversQuery.data);

  // Handle cover selection with image preloading
  const handleCoverSelect = async (coverUrl: string) => {
    try {
      setIsProcessing(true);

      // Preload the image to ensure it's in the cache
      const imagePromise = new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = coverUrl;
      });

      await imagePromise;

      // Now call the onCoverSelect prop with the URL
      onCoverSelect(coverUrl);
      onClose();
    } catch (err) {
      console.error("Error selecting cover:", err);
      setError("Failed to load the selected cover image");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Select Cover</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          {coversQuery.isLoading || isProcessing ? (
            <div className="flex justify-center p-8 text-center">
              <div>
                <div className="border-primary mb-3 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                <p>
                  {isProcessing
                    ? "Processing cover image..."
                    : "Searching for covers..."}
                </p>
              </div>
            </div>
          ) : (
            <>
              {covers.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {covers.map((cover, index) => (
                    <div
                      key={index}
                      className="cursor-pointer overflow-hidden rounded border transition-colors hover:bg-gray-50"
                      onClick={() => handleCoverSelect(cover.coverUrl)}
                    >
                      <div className="relative aspect-[3/4] w-full">
                        <img
                          src={cover.coverUrl}
                          alt={`Cover for ${cover.title}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="p-2 text-xs">
                        <p className="line-clamp-2 font-medium">
                          {cover.title}
                        </p>
                        <p className="line-clamp-1 text-gray-600">
                          {cover.author}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !error && (
                  <p className="py-8 text-center text-gray-500">
                    No covers found for this ISBN.
                  </p>
                )
              )}

              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
