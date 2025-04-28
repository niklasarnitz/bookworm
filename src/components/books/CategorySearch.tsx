import React, { useEffect, useState } from "react";
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
import type { Category } from "~/schemas/category";

interface CategorySearchProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}

export function CategorySearch({
  value,
  onChange,
  placeholder = "Select a category...",
}: Readonly<CategorySearchProps>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories, isLoading } = api.category.getAll.useQuery();

  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    display: string;
  } | null>(null);

  const { data: categoryPath } = api.category.getPath.useQuery(
    { id: value ?? "" },
    { enabled: !!value },
  );

  useEffect(() => {
    if (!value || !categoryPath?.length) {
      setSelectedCategory(null);
      return;
    }

    const displayPath = categoryPath.map((cat) => cat.name).join(" > ");
    const pathDisplay = `${categoryPath[categoryPath.length - 1]?.path} > ${displayPath}`;

    setSelectedCategory({
      id: value,
      display: pathDisplay,
    });
  }, [value, categoryPath]);

  const organizedCategories = React.useMemo(() => {
    if (!categories) return [];

    const formatCategory = (
      category: Category,
    ): { id: string; display: string } => {
      return {
        id: category.id,
        display: `${category.path} > ${category.name}`,
      };
    };

    return categories
      .filter((cat) =>
        searchQuery
          ? cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.path.includes(searchQuery)
          : true,
      )
      .map(formatCategory)
      .sort((a, b) => a.display.localeCompare(b.display));
  }, [categories, searchQuery]);

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
          {selectedCategory ? (
            <span className="truncate">{selectedCategory.display}</span>
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
        <Command
          filter={(value, search) => {
            // We handle this manually via the organizedCategories memo
            return 1;
          }}
        >
          <CommandInput
            placeholder="Search category..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {!isLoading &&
                organizedCategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.id}
                    onSelect={() => {
                      onChange(
                        category.id === selectedCategory?.id
                          ? undefined
                          : category.id,
                      );
                      setSelectedCategory(
                        category.id === selectedCategory?.id ? null : category,
                      );
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCategory?.id === category.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span className="truncate">{category.display}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
