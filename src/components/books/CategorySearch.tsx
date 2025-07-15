import React from "react";
import { api } from "~/trpc/react";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "~/components/ui/searchable-select";

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
  const { data: categories, isLoading } = api.category.getAll.useQuery();

  const { data: categoryPath } = api.category.getPath.useQuery(
    { id: value ?? "" },
    { enabled: !!value },
  );

  const categoryOptions: SearchableSelectOption[] =
    categories?.map((category) => ({
      id: category.id,
      name: category.name,
      display: `${"  ".repeat(category.level)}${category.name}`,
      description: categoryPath?.find((c) => c.id === category.id)
        ? categoryPath.map((c) => c.name).join(" > ")
        : undefined,
    })) ?? [];

  const formatDisplay = (option: SearchableSelectOption) => {
    if (value === option.id && categoryPath?.length) {
      return categoryPath.map((c) => c.name).join(" > ");
    }
    return option.display ?? option.name;
  };

  const handleChange = (
    selectedOption: { id: string; name: string } | undefined,
  ) => {
    onChange(selectedOption?.id);
  };

  return (
    <SearchableSelect
      value={value}
      onChange={handleChange}
      options={categoryOptions}
      placeholder={placeholder}
      emptyMessage="No categories found."
      isLoading={isLoading}
      formatDisplay={formatDisplay}
    />
  );
}
