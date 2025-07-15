"use client";

import * as React from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ChartContainer } from "~/components/ui/chart";

interface ReadingProgressChartClientProps {
  data: {
    date: string;
    books: number;
  }[];
}

// Define proper type for the tooltip props
type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value: number;
    name?: string;
    dataKey: string;
  }>;
  label?: string;
};

// Custom tooltip component with proper types
const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="border-border bg-background rounded-lg border p-2 shadow-sm">
      <p className="font-medium">{label}</p>
      <p className="text-foreground text-sm">{`${payload[0]?.value} books`}</p>
    </div>
  );
};

export function ReadingProgressChartClient({
  data,
}: Readonly<ReadingProgressChartClientProps>) {
  if (!data.length) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No reading data available</p>
      </div>
    );
  }

  return (
    <ChartContainer
      className="h-full w-full"
      config={{ books: { label: "Books" } }}
    >
      <RechartsAreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="booksGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
          stroke="currentColor"
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          stroke="currentColor"
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="books"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#booksGradient)"
          activeDot={{ r: 6 }}
        />
      </RechartsAreaChart>
    </ChartContainer>
  );
}
