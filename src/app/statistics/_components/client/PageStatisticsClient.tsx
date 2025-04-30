"use client";

import * as React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { ChartContainer } from "~/components/ui/chart";
import { Progress } from "~/components/ui/progress";

interface PageStatisticsClientProps {
  data: {
    totalPages: number;
    readPages: number;
    booksWithPages: number;
    booksWithoutPages: number;
    readPercentage: number;
  };
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
};

// Custom tooltip component with proper types
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="border-border bg-background rounded-lg border p-2 shadow-sm">
      <p className="font-medium">{payload[0]?.name}</p>
      <p className="text-foreground text-sm">
        {`${payload[0]?.value.toLocaleString()} pages`}
      </p>
    </div>
  );
};

export function PageStatisticsClient({
  data,
}: Readonly<PageStatisticsClientProps>) {
  const {
    totalPages,
    readPages,
    booksWithPages,
    booksWithoutPages,
    readPercentage,
  } = data;

  const completionData = [
    {
      name: "Read",
      value: readPages,
    },
    {
      name: "Unread",
      value: totalPages - readPages,
    },
  ];

  // Create config object for chart
  const chartConfig = {
    Read: { color: "hsl(var(--primary))" },
    Unread: { color: "hsl(var(--muted))" },
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <div className="grid gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Total Pages</p>
            <p className="text-2xl font-semibold">
              {totalPages.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Read Pages</p>
            <p className="text-2xl font-semibold">
              {readPages.toLocaleString()}
            </p>
          </div>
          <div>
            <div className="mb-2 flex justify-between">
              <p className="text-muted-foreground text-sm">Completion</p>
              <p className="text-muted-foreground text-sm">{readPercentage}%</p>
            </div>
            <Progress value={readPercentage} className="w-full" />
          </div>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="h-[170px]">
          <ChartContainer className="h-full w-full" config={chartConfig}>
            <RechartsBarChart
              data={completionData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="currentColor"
              />
              <YAxis
                dataKey="name"
                type="category"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="currentColor"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {completionData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={
                      entry.name === "Read"
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted))"
                    }
                  />
                ))}
              </Bar>
            </RechartsBarChart>
          </ChartContainer>
        </div>
        <div className="text-muted-foreground mt-4 text-xs">
          <p>
            * Page statistics are available for {booksWithPages} book
            {booksWithPages !== 1 ? "s" : ""}.
            {booksWithoutPages > 0 &&
              ` ${booksWithoutPages} book${booksWithoutPages !== 1 ? "s" : ""} without page count.`}
          </p>
        </div>
      </div>
    </div>
  );
}
