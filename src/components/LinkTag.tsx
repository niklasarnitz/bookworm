import clsx from "clsx";
import Link from "next/link";

type LinkTagProps = {
  href: string;
  color: "blue" | "purple" | "green";
  children?: React.ReactNode;
};

const colors: Record<(typeof LinkTagProps)["color"], string> = {
  blue: "bg-blue-100/50 text-blue-700 hover:bg-blue-200/50 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-800/30",
  purple:
    "bg-purple-100/50 text-purple-700 hover:bg-purple-200/50 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-800/30",
  green:
    "bg-green-100/50 text-green-700 hover:bg-green-200/50 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-800/30",
};

export const LinkTag = ({ href, color, children }: Readonly<LinkTagProps>) => {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-1 text-xs",
        colors[color],
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </Link>
  );
};
