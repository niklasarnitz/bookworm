import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import type {
  TvShowDetail,
  TvShowSearchResult,
} from "~/lib/tv-show-metadata/types";
import { Search, Calendar, Globe, Tv } from "lucide-react";
import Image from "next/image";

interface TvShowSearchDialogProps {
  onTvShowSelect: (tvShowData: TvShowDetail) => void;
  onClose: () => void;
  initialTitle?: string;
}

export function TvShowSearchDialog({
  onTvShowSelect,
  onClose,
  initialTitle = "",
}: Readonly<TvShowSearchDialogProps>) {
  const [searchTitle, setSearchTitle] = useState(initialTitle);
  const [shouldSearch, setShouldSearch] = useState(false);
  const [selectedTmdbId, setSelectedTmdbId] = useState<string>("");

  const searchQuery = api.tvShowMetadata.searchAllServices.useQuery(
    { title: searchTitle.trim() },
    { enabled: shouldSearch && !!searchTitle.trim() },
  );

  const tvShowDetailQuery = api.tvShowMetadata.getTvShowDetail.useQuery(
    { serviceId: "tmdb", tmdbId: selectedTmdbId },
    { enabled: !!selectedTmdbId },
  );

  const handleSearch = () => {
    if (!searchTitle.trim()) return;
    setSelectedTmdbId("");
    setShouldSearch(true);
  };

  const handleTvShowSelect = (tvShow: TvShowSearchResult) => {
    setSelectedTmdbId(tvShow.tmdbId);
  };

  const handleConfirmSelection = () => {
    if (tvShowDetailQuery.data?.tvShowDetail) {
      onTvShowSelect(tvShowDetailQuery.data.tvShowDetail);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Reset search state when search title changes
  useEffect(() => {
    setShouldSearch(false);
  }, [searchTitle]);

  const isSearching = searchQuery.isFetching;
  const isLoadingDetail = tvShowDetailQuery.isFetching;
  const searchResults = searchQuery.data ?? [];
  const tvShowDetail = tvShowDetailQuery.data?.tvShowDetail;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Search TV Show Database</DialogTitle>
          <DialogDescription>
            Search for TV show information from The Movie Database (TMDB)
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-8rem)] space-y-4 overflow-x-hidden overflow-y-auto">
          {/* Search Input */}
          <div className="flex w-full min-w-0 gap-2">
            <div className="min-w-0 flex-1">
              <Label htmlFor="search-title">TV Show Title</Label>
              <Input
                id="search-title"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter TV show title..."
                disabled={isSearching}
                className="w-full"
              />
            </div>
            <div className="flex-shrink-0 self-end">
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchTitle.trim()}
                className="px-6 whitespace-nowrap"
              >
                {isSearching ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search
              </Button>
            </div>
          </div>

          {/* TV Show Detail Preview */}
          {tvShowDetail && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Selected TV Show Details
                  <Badge variant="secondary">
                    TMDB ID: {tvShowDetail.tmdbId}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex min-w-0 gap-4">
                  {tvShowDetail.posterUrl && (
                    <div className="flex-shrink-0">
                      <Image
                        src={tvShowDetail.posterUrl}
                        alt={`${tvShowDetail.name} poster`}
                        width={150}
                        height={225}
                        className="rounded-md object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-2">
                    <h3 className="text-lg font-semibold break-words">
                      {tvShowDetail.name}
                    </h3>
                    {tvShowDetail.originalName !== tvShowDetail.name && (
                      <p className="text-muted-foreground text-sm break-words">
                        Original Title: {tvShowDetail.originalName}
                      </p>
                    )}
                    <div className="text-muted-foreground flex flex-wrap gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {tvShowDetail.firstAirYear}
                      </div>
                      <div className="flex items-center gap-1">
                        <Tv className="h-3 w-3" />
                        {tvShowDetail.numberOfSeasons} seasons
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {tvShowDetail.originalLanguage.toUpperCase()}
                      </div>
                    </div>
                    {tvShowDetail.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tvShowDetail.genres.map((genre) => (
                          <Badge
                            key={genre}
                            variant="outline"
                            className="text-xs"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="line-clamp-3 text-sm break-words">
                      {tvShowDetail.overview}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={handleConfirmSelection} className="flex-1">
                    Use This TV Show
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedTmdbId("");
                    }}
                  >
                    Cancel Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && !tvShowDetail && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Search Results</h3>
              {searchResults.map((serviceResult) => (
                <div key={serviceResult.serviceId}>
                  <h4 className="mb-2 flex items-center gap-2 font-medium">
                    {serviceResult.serviceName}
                    <Badge variant="secondary">
                      {serviceResult.results.length} results
                    </Badge>
                  </h4>
                  {serviceResult.error ? (
                    <Card className="border-destructive">
                      <CardContent className="pt-4">
                        <p className="text-destructive text-sm">
                          Error: {serviceResult.error}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-2">
                      {serviceResult.results.map((tvShow) => (
                        <Card
                          key={tvShow.tmdbId}
                          className="cursor-pointer transition-shadow hover:shadow-md"
                          onClick={() => handleTvShowSelect(tvShow)}
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-3">
                              {tvShow.posterUrl && (
                                <Image
                                  src={tvShow.posterUrl}
                                  alt={`${tvShow.name} poster`}
                                  width={60}
                                  height={90}
                                  className="flex-shrink-0 rounded object-cover"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <h5 className="font-medium break-words">
                                  {tvShow.name} ({tvShow.firstAirYear})
                                </h5>
                                {tvShow.originalName !== tvShow.name && (
                                  <p className="text-muted-foreground text-xs break-words">
                                    {tvShow.originalName}
                                  </p>
                                )}
                                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                                  {tvShow.overview}
                                </p>
                                <div className="mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    TMDB: {tvShow.tmdbId}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Loading State for TV Show Detail */}
          {isLoadingDetail && (
            <Card>
              <CardContent className="p-8 text-center">
                <Spinner className="mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  Loading TV show details...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isSearching && searchResults.length === 0 && shouldSearch && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No TV shows found. Try a different search term.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Initial State */}
          {!shouldSearch && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Enter a TV show title and click search to find TV shows.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
