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

interface AuthorSearchProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}

export function AuthorSearch({
  value,
  onChange,
  placeholder = "Select an author...",
}: Readonly<AuthorSearchProps>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: authorsData, isLoading } = api.author.getAll.useQuery();

  const [selectedAuthor, setSelectedAuthor] = useState<{
    id: string;
    name: string;
    bookCount?: number;
  } | null>(null);

  // Update the selected author based on the provided value
  useEffect(() => {
    if (!value) {
      setSelectedAuthor(null);
      return;
    }

    const found = authorsData?.authors.find((author) => author.id === value);
    if (found) {
      setSelectedAuthor({
        id: found.id,
        name: found.name,
        bookCount: found._count?.books,
      });
    }
  }, [value, authorsData]);

  const filteredAuthors = useMemo(() => {
    return authorsData?.authors
      .filter(
        (author) =>
          !searchQuery ||
          author.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [authorsData, searchQuery]);

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
          {selectedAuthor ? (
            <span>
              {selectedAuthor.name}
              {selectedAuthor.bookCount !== undefined && (
                <span className="text-muted-foreground ml-1 text-xs">
                  ({selectedAuthor.bookCount})
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
            placeholder="Search author..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No author found.</CommandEmpty>
            <CommandGroup>
              {!isLoading &&
                filteredAuthors?.map((author) => (
                  <CommandItem
                    key={author.id}
                    value={author.id}
                    onSelect={() => {
                      onChange(
                        author.id === selectedAuthor?.id
                          ? undefined
                          : author.id,
                      );
                      setSelectedAuthor(
                        author.id === selectedAuthor?.id
                          ? null
                          : {
                              id: author.id,
                              name: author.name,
                              bookCount: author._count?.books,
                            },
                      );
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedAuthor?.id === author.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span>{author.name}</span>
                    {author._count?.books !== undefined && (
                      <span className="text-muted-foreground ml-1 text-xs">
                        ({author._count.books})
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
