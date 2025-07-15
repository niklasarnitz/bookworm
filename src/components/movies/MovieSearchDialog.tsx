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
  MovieDetail,
  MovieSearchResult,
} from "~/lib/movie-metadata/types";
import { Search, Calendar, Globe, Clock } from "lucide-react";
import Image from "next/image";

interface MovieSearchDialogProps {
  onMovieSelect: (movieData: MovieDetail) => void;
  onClose: () => void;
  initialTitle?: string;
}

export function MovieSearchDialog({
  onMovieSelect,
  onClose,
  initialTitle = "",
}: Readonly<MovieSearchDialogProps>) {
  const [searchTitle, setSearchTitle] = useState(initialTitle);
  const [shouldSearch, setShouldSearch] = useState(false);
  const [selectedTmdbId, setSelectedTmdbId] = useState<string>("");

  const searchQuery = api.movieMetadata.searchAllServices.useQuery(
    { title: searchTitle.trim() },
    { enabled: shouldSearch && !!searchTitle.trim() },
  );

  const movieDetailQuery = api.movieMetadata.getMovieDetail.useQuery(
    { serviceId: "tmdb", tmdbId: selectedTmdbId },
    { enabled: !!selectedTmdbId },
  );

  const handleSearch = () => {
    if (!searchTitle.trim()) return;
    setSelectedTmdbId("");
    setShouldSearch(true);
  };

  const handleMovieSelect = (movie: MovieSearchResult) => {
    setSelectedTmdbId(movie.tmdbId);
  };

  const handleConfirmSelection = () => {
    if (movieDetailQuery.data?.movieDetail) {
      onMovieSelect(movieDetailQuery.data.movieDetail);
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
  const isLoadingDetail = movieDetailQuery.isFetching;
  const searchResults = searchQuery.data ?? [];
  const movieDetail = movieDetailQuery.data?.movieDetail;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Search Movie Database</DialogTitle>
          <DialogDescription>
            Search for movie information from The Movie Database (TMDB)
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-8rem)] space-y-4 overflow-x-hidden overflow-y-auto">
          {/* Search Input */}
          <div className="flex w-full min-w-0 gap-2">
            <div className="min-w-0 flex-1">
              <Label htmlFor="search-title">Movie Title</Label>
              <Input
                id="search-title"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter movie title..."
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

          {/* Movie Detail Preview */}
          {movieDetail && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Selected Movie Details
                  <Badge variant="secondary">
                    TMDB ID: {movieDetail.tmdbId}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex min-w-0 gap-4">
                  {movieDetail.posterUrl && (
                    <div className="flex-shrink-0">
                      <Image
                        src={movieDetail.posterUrl}
                        alt={`${movieDetail.title} poster`}
                        width={150}
                        height={225}
                        className="rounded-md object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-2">
                    <h3 className="text-lg font-semibold break-words">
                      {movieDetail.title}
                    </h3>
                    {movieDetail.originalTitle !== movieDetail.title && (
                      <p className="text-muted-foreground text-sm break-words">
                        Original Title: {movieDetail.originalTitle}
                      </p>
                    )}
                    <div className="text-muted-foreground flex flex-wrap gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {movieDetail.releaseYear}
                      </div>
                      {movieDetail.runtime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {movieDetail.runtime} minutes
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {movieDetail.originalLanguage.toUpperCase()}
                      </div>
                    </div>
                    {movieDetail.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {movieDetail.genres.map((genre) => (
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
                      {movieDetail.overview}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={handleConfirmSelection} className="flex-1">
                    Use This Movie
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
          {searchResults.length > 0 && !movieDetail && (
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
                      {serviceResult.results.map((movie) => (
                        <Card
                          key={movie.tmdbId}
                          className="cursor-pointer transition-shadow hover:shadow-md"
                          onClick={() => handleMovieSelect(movie)}
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-3">
                              {movie.posterUrl && (
                                <Image
                                  src={movie.posterUrl}
                                  alt={`${movie.title} poster`}
                                  width={60}
                                  height={90}
                                  className="flex-shrink-0 rounded object-cover"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <h5 className="font-medium break-words">
                                  {movie.title} ({movie.releaseYear})
                                </h5>
                                {movie.originalTitle !== movie.title && (
                                  <p className="text-muted-foreground text-xs break-words">
                                    {movie.originalTitle}
                                  </p>
                                )}
                                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                                  {movie.overview}
                                </p>
                                <div className="mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    TMDB: {movie.tmdbId}
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

          {/* Loading State for Movie Detail */}
          {isLoadingDetail && (
            <Card>
              <CardContent className="p-8 text-center">
                <Spinner className="mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  Loading movie details...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isSearching && searchResults.length === 0 && shouldSearch && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No movies found. Try a different search term.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Initial State */}
          {!shouldSearch && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Enter a movie title and click search to find movies.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
