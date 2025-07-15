import React, { useState, useMemo, useEffect } from "react";
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

export interface SearchableSelectOption {
  id: string;
  name: string;
  display?: string;
  description?: string;
  count?: number;
}

interface SearchableSelectProps {
  value?: string | { id: string; name: string };
  onChange: (value: { id: string; name: string } | undefined) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  formatDisplay?: (option: SearchableSelectOption) => string;
  className?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  emptyMessage = "No options found.",
  isLoading = false,
  formatDisplay,
  className,
}: Readonly<SearchableSelectProps>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedOption, setSelectedOption] = useState<{
    id: string;
    display: string;
  } | null>(null);

  // Update the selected option based on the provided value
  useEffect(() => {
    if (!value) {
      setSelectedOption(null);
      return;
    }

    let valueId: string;
    let valueName: string;

    if (typeof value === "string") {
      valueId = value;
      const found = options.find((option) => option.id === valueId);
      valueName = found?.name ?? "";
    } else {
      valueId = value.id;
      valueName = value.name;
    }

    const found = options.find((option) => option.id === valueId);
    if (found) {
      const display = formatDisplay
        ? formatDisplay(found)
        : (found.display ?? found.name);
      setSelectedOption({
        id: found.id,
        display,
      });
    } else if (typeof value === "object") {
      // Use the provided object if option not found in list
      setSelectedOption({
        id: valueId,
        display: valueName,
      });
    }
  }, [value, options, formatDisplay]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) {
      return options;
    }

    return options.filter((option) => {
      const query = searchQuery.toLowerCase();
      return (
        option.name.toLowerCase().includes(query) ||
        (option.display?.toLowerCase().includes(query) ?? false) ||
        (option.description?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [options, searchQuery]);

  const handleSelect = (selectedId: string) => {
    const isCurrentlySelected = selectedId === selectedOption?.id;
    const newValue = isCurrentlySelected ? undefined : selectedId;

    if (newValue) {
      const option = options.find((opt) => opt.id === newValue);
      if (option) {
        onChange({ id: option.id, name: option.name });
        setSelectedOption({
          id: option.id,
          display: formatDisplay
            ? formatDisplay(option)
            : (option.display ?? option.name),
        });
      }
    } else {
      onChange(undefined);
      setSelectedOption(null);
    }

    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal",
            className,
          )}
          onClick={() => setOpen(!open)}
        >
          {selectedOption ? (
            <span className="truncate">{selectedOption.display}</span>
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
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {!isLoading &&
                filteredOptions.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedOption?.id === option.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <div className="flex-1 truncate">
                      <span>
                        {formatDisplay
                          ? formatDisplay(option)
                          : (option.display ?? option.name)}
                      </span>
                      {option.count !== undefined && (
                        <span className="text-muted-foreground ml-1 text-xs">
                          ({option.count})
                        </span>
                      )}
                      {option.description && (
                        <div className="text-muted-foreground truncate text-xs">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
