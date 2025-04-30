"use client";

import * as React from "react";
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "~/components/ui/chart";

interface CategoryDistributionChartClientProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

// Define proper type for the tooltip props
type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value: number;
    name?: string;
    payload: {
      name: string;
      value: number;
    };
  }>;
  label?: string;
};

// Define proper type for the legend props
type CustomLegendProps = {
  payload?: Array<{
    value: string;
    color: string;
    payload?: {
      name: string;
      value: number;
    };
  }>;
};

// Custom tooltip component with proper types
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="border-border bg-background rounded-lg border p-2 shadow-sm">
      <p className="font-medium">{payload[0]?.name}</p>
      <p className="text-foreground text-sm">{`${payload[0]?.value} books`}</p>
    </div>
  );
};

// Custom legend renderer with proper types
const CustomLegend: React.FC<CustomLegendProps> = ({ payload }) => {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-xs">
      {payload.map((entry) => (
        <div
          key={`legend-${entry.value}`}
          className="flex items-center gap-1.5"
        >
          <div
            className="h-2 w-2 rounded-[2px]"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function CategoryDistributionChartClient({
  data,
}: Readonly<CategoryDistributionChartClientProps>) {
  if (!data.length) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No category data available</p>
      </div>
    );
  }

  // Using CSS variables for colors that respect dark/light mode
  const CHART_COLORS = [
    "hsl(var(--chart-1, 220 70% 50%))",
    "hsl(var(--chart-2, 160 60% 45%))",
    "hsl(var(--chart-3, 30 80% 55%))",
    "hsl(var(--chart-4, 280 65% 60%))",
    "hsl(var(--chart-5, 340 75% 55%))",
    "hsl(var(--chart-6, 265 70% 60%))",
    "hsl(var(--chart-7, 335 70% 60%))",
    "hsl(var(--chart-8, 165 70% 60%))",
    "hsl(var(--chart-9, 195 70% 60%))",
    "hsl(var(--chart-10, 45 70% 60%))",
  ];

  // Create config object for chart categorizing based on data
  const chartConfig = data.reduce((acc, item) => {
    return {
      ...acc,
      [item.name]: {
        label: item.name,
      },
    };
  }, {});

  return (
    <ChartContainer className="h-full w-full" config={chartConfig}>
      <RechartsPieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <Pie
          data={data}
          nameKey="name"
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={40}
          paddingAngle={1}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
          stroke="transparent"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </RechartsPieChart>
    </ChartContainer>
  );
}
