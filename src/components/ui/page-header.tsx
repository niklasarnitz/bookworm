import React from "react";
import { cn } from "~/lib/utils";
import { TypographyH1, TypographyMuted } from "./typography";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-center justify-between gap-4",
        className,
      )}
    >
      <div>
        <TypographyH1>{title}</TypographyH1>
        {description && <TypographyMuted>{description}</TypographyMuted>}
      </div>
      {children && (
        <div className="ml-auto flex items-center gap-2">{children}</div>
      )}
    </div>
  );
}
