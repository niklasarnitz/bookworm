import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { TvShowSearchDialog } from "./TvShowSearchDialog";
import type { TvShowDetail } from "~/lib/tv-show-metadata/types";
import { Search } from "lucide-react";

interface TvShowMetadataSearchProps {
  onTvShowSelect: (tvShowData: TvShowDetail) => void;
  title?: string | null;
  buttonLabel?: string;
}

/**
 * A component for searching and fetching TV show metadata from TMDB
 */
export function TvShowMetadataSearch({
  onTvShowSelect,
  title,
  buttonLabel = "Search Metadata",
}: Readonly<TvShowMetadataSearchProps>) {
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
        aria-label="Search for TV show metadata using title"
      >
        <Search className="mr-1 h-3 w-3" />
        {buttonLabel}
      </Button>

      {isDialogOpen && (
        <TvShowSearchDialog
          onTvShowSelect={onTvShowSelect}
          onClose={handleCloseDialog}
          initialTitle={title ?? ""}
        />
      )}
    </>
  );
}
