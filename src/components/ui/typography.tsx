import React from "react";
import { cn } from "~/lib/utils";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function TypographyH1({ children, className }: TypographyProps) {
  return (
    <h1
      className={cn(
        "text-2xl leading-tight font-bold tracking-tight",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function TypographyH2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn("text-xl leading-tight font-semibold", className)}>
      {children}
    </h2>
  );
}

export function TypographyH3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn("text-base leading-tight font-semibold", className)}>
      {children}
    </h3>
  );
}

export function TypographyP({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-base leading-relaxed", className)}>{children}</p>
  );
}

export function TypographySmall({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)}>{children}</p>
  );
}

export function TypographyMuted({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)}>{children}</p>
  );
}

export function TypographyLead({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-muted-foreground text-lg", className)}>{children}</p>
  );
}

export function TypographyLarge({ children, className }: TypographyProps) {
  return <p className={cn("text-lg font-semibold", className)}>{children}</p>;
}
