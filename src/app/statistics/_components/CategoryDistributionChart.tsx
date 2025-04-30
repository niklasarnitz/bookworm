import { api } from "~/trpc/server";
import { CategoryDistributionChartClient } from "./client/CategoryDistributionChartClient";

export async function CategoryDistributionChart() {
  const data = await api.statistics.getCategoryDistribution();

  if (!data || data.categories.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No category data available</p>
      </div>
    );
  }

  const { categories } = data;

  const chartData = [];

  // Add categories sorted by count
  const sortedCategories = [...categories].sort((a, b) => b.count - a.count);

  // Take top categories if there are too many
  if (sortedCategories.length > 10) {
    const topCategories = sortedCategories.slice(0, 9);
    const otherCount = sortedCategories
      .slice(9)
      .reduce((sum, cat) => sum + cat.count, 0);

    chartData.push(
      ...topCategories.map((cat) => ({
        name: `${cat.path} ${cat.name}`,
        value: cat.count,
      })),
    );

    if (otherCount > 0) {
      chartData.push({ name: "Other Categories", value: otherCount });
    }
  } else {
    // Just use all categories
    chartData.push(
      ...sortedCategories.map((cat) => ({
        name: cat.name,
        value: cat.count,
      })),
    );
  }

  return <CategoryDistributionChartClient data={chartData} />;
}
