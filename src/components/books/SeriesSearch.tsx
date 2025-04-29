"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

interface SeriesSearchProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}

export function SeriesSearch({
  value,
  onChange,
  placeholder = "Select a series...",
}: Readonly<SeriesSearchProps>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: seriesData, isLoading } = api.series.getAll.useQuery();

  const [selectedSeries, setSelectedSeries] = useState<{
    id: string;
    name: string;
    bookCount?: number;
  } | null>(null);

  useEffect(() => {
    if (!value) {
      setSelectedSeries(null);
      return;
    }

    const found = seriesData?.series.find((series) => series.id === value);
    if (found) {
      setSelectedSeries({
        id: found.id,
        name: found.name,
        bookCount: found._count?.books,
      });
    }
  }, [value, seriesData?.series]);

  const filteredSeries = useMemo(() => {
    return seriesData?.series
      .filter(
        (series) =>
          !searchQuery ||
          series.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [seriesData?.series, searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
          onClick={() => setOpen(!open)}
        >
          {selectedSeries ? (
            <span>
              {selectedSeries.name}
              {selectedSeries.bookCount !== undefined && (
                <span className="text-muted-foreground ml-1 text-xs">
                  ({selectedSeries.bookCount})
                </span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Search series..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No series found.</CommandEmpty>
            <CommandGroup>
              {!isLoading &&
                filteredSeries?.map((series) => (
                  <CommandItem
                    key={series.id}
                    value={series.id}
                    onSelect={() => {
                      onChange(
                        series.id === selectedSeries?.id
                          ? undefined
                          : series.id,
                      );
                      setSelectedSeries(
                        series.id === selectedSeries?.id
                          ? null
                          : {
                              id: series.id,
                              name: series.name,
                              bookCount: series._count?.books,
                            },
                      );
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedSeries?.id === series.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span>{series.name}</span>
                    {series._count?.books !== undefined && (
                      <span className="text-muted-foreground ml-1 text-xs">
                        ({series._count.books})
                      </span>
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
