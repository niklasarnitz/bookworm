"use client";

import React from "react";
import { api } from "~/trpc/react";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "~/components/ui/searchable-select";

interface AuthorSearchProps {
  value?: string | { id: string; name: string };
  onChange: (value: { id: string; name: string } | undefined) => void;
  placeholder?: string;
}

export function AuthorSearch({
  value,
  onChange,
  placeholder = "Select an author...",
}: Readonly<AuthorSearchProps>) {
  const { data: authorsData, isLoading } = api.author.getAll.useQuery();

  const authorOptions: SearchableSelectOption[] =
    authorsData?.authors.map((author) => ({
      id: author.id,
      name: author.name,
      count: author._count?.books,
    })) ?? [];

  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={authorOptions}
      placeholder={placeholder}
      emptyMessage="No authors found."
      isLoading={isLoading}
    />
  );
}
