import clsx from "clsx";
import Link from "next/link";

type LinkTagProps = {
  href: string;
  color: "blue" | "purple" | "green";
  children?: React.ReactNode;
};

const colors: Record<LinkTagProps["color"], string> = {
  blue: "bg-blue-100/50 text-blue-700 hover:bg-blue-200/70 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40",
  purple:
    "bg-purple-100/50 text-purple-700 hover:bg-purple-200/70 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/40",
  green:
    "bg-green-100/50 text-green-700 hover:bg-green-200/70 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/40",
};

export const LinkTag = ({ href, color, children }: Readonly<LinkTagProps>) => {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-center text-xs font-medium",
        "flex-wrap break-words transition-colors duration-200 ease-in-out",
        "shadow-sm hover:shadow-md",
        "min-h-[24px] leading-tight",
        colors[color],
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </Link>
  );
};
