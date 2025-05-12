import {
  ChevronDown,
  ChevronRight,
  Edit,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { CategoryAccordion } from "~/app/(main)/categories/_components/CategoryAccordion";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import type { Category } from "~/schemas/category";

export function CategoryItem({
  category,
  expandedIds,
  toggleExpand,
  onEdit,
  onDelete,
  level,
}: Readonly<{
  category: Category;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  level: number;
}>) {
  const hasChildren = !!category.children?.length;
  const isExpanded = expandedIds.has(category.id);

  return (
    <div
      className={cn(
        "mb-1 rounded-sm border",
        level > 0 ? "ml-4 border-dashed" : "",
      )}
    >
      <div className="hover:bg-muted/40 group flex items-center justify-between rounded-sm p-2">
        <div
          className="flex flex-1 cursor-pointer items-center gap-2"
          onClick={() => hasChildren && toggleExpand(category.id)}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <span className="w-6"></span>
          )}

          {isExpanded ? (
            <FolderOpen className="text-muted-foreground h-4 w-4" />
          ) : (
            <Folder className="text-muted-foreground h-4 w-4" />
          )}

          <Link href={`/?categoryId=${category.id}`}>
            <span className="font-medium">{category.name}</span>
          </Link>

          <div className="flex gap-2">
            {category._count && category._count.books > 0 && (
              <Badge variant="outline">
                {category._count.books}{" "}
                {category._count.books === 1 ? "book" : "books"}
              </Badge>
            )}

            {category.totalBookCount !== undefined &&
              category.totalBookCount !== (category._count?.books || 0) && (
                <Badge variant="secondary">
                  {category.totalBookCount} total
                </Badge>
              )}
          </div>
        </div>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(category)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mb-2">
          <CategoryAccordion
            categories={category.children ?? []}
            expandedIds={expandedIds}
            toggleExpand={toggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
            level={level + 1}
          />
        </div>
      )}
    </div>
  );
}
