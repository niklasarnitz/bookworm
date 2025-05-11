import { cn } from "~/lib/utils";
import Link from "next/link";

type LinkTagProps = {
  href: string;
  color: "blue" | "purple" | "green" | "red" | "amber" | "gray";
  children?: React.ReactNode;
  className?: string;
};

const colors: Record<LinkTagProps["color"], string> = {
  blue: "bg-blue-100/50 text-blue-700 hover:bg-blue-200/70 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40",
  purple:
    "bg-purple-100/50 text-purple-700 hover:bg-purple-200/70 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/40",
  green:
    "bg-green-100/50 text-green-700 hover:bg-green-200/70 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/40",
  red: "bg-red-100/50 text-red-700 hover:bg-red-200/70 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/40",
  amber:
    "bg-amber-100/50 text-amber-700 hover:bg-amber-200/70 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-800/40",
  gray: "bg-gray-100/50 text-gray-700 hover:bg-gray-200/70 dark:bg-gray-800/30 dark:text-gray-300 dark:hover:bg-gray-700/40",
};

export const LinkTag = ({
  href,
  color,
  children,
  className,
}: Readonly<LinkTagProps>) => {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-center text-xs font-medium",
        "transition-colors duration-200 ease-in-out",
        "focus-visible:ring-ring shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:outline-none",
        "min-h-[24px] leading-tight",
        colors[color],
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </Link>
  );
};
