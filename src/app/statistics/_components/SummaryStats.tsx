import { BookOpen, BookText, Library, FolderTree } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/server";

export async function SummaryStats() {
  // Fetch data from server
  const data = await api.statistics.getSummary();
  const { totalBooks, readBooks, totalAuthors, totalCategories, totalSeries } =
    data;
  const readPercentage =
    totalBooks > 0 ? Math.round((readBooks / totalBooks) * 100) : 0;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Books</CardTitle>
          <BookText className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBooks}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Read Books</CardTitle>
          <BookOpen className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">{readBooks}</div>
            <p className="text-muted-foreground text-xs">
              {readPercentage}% of library read
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Authors</CardTitle>
          <Library className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAuthors}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <FolderTree className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-muted-foreground text-xs">
              {totalSeries} series
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
