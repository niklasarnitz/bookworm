import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { MovieSearchDialog } from "./MovieSearchDialog";
import type { MovieDetail } from "~/lib/movie-metadata/types";
import { Search } from "lucide-react";

interface MovieMetadataSearchProps {
  onMovieSelect: (movieData: MovieDetail) => void;
  title?: string | null;
  buttonLabel?: string;
}

/**
 * A component for searching and fetching movie metadata from TMDB
 */
export function MovieMetadataSearch({
  onMovieSelect,
  title,
  buttonLabel = "Search Metadata",
}: Readonly<MovieMetadataSearchProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleOpenDialog}
        className="text-xs"
        aria-label="Search for movie metadata using title"
      >
        <Search className="mr-1 h-3 w-3" />
        {buttonLabel}
      </Button>

      {isDialogOpen && (
        <MovieSearchDialog
          onMovieSelect={onMovieSelect}
          onClose={handleCloseDialog}
          initialTitle={title ?? ""}
        />
      )}
    </>
  );
}
