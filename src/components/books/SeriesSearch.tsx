"use client";

import React from "react";
import { api } from "~/trpc/react";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "~/components/ui/searchable-select";

interface SeriesSearchProps {
  value?: string | { id: string; name: string };
  onChange: (value: { id: string; name: string } | undefined) => void;
  placeholder?: string;
}

export function SeriesSearch({
  value,
  onChange,
  placeholder = "Select a series...",
}: Readonly<SeriesSearchProps>) {
  const { data: seriesData, isLoading } = api.series.getAll.useQuery();

  const seriesOptions: SearchableSelectOption[] =
    seriesData?.series.map((series) => ({
      id: series.id,
      name: series.name,
      count: series._count?.books,
    })) ?? [];

  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={seriesOptions}
      placeholder={placeholder}
      emptyMessage="No series found."
      isLoading={isLoading}
    />
  );
}
