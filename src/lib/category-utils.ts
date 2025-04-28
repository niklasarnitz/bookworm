import type { Category } from "@prisma/client";

/**
 * Compares two category paths numerically for proper hierarchical sorting
 *
 * This ensures paths like "1.2.10" are sorted after "1.2.2" (as 10 > 2)
 * Example of proper category path ordering:
 * 1, 1.1, 1.1.10, 2.1, 10, 10.1, 20.1
 */
export function compareNumericPaths(pathA: string, pathB: string): number {
  // Split the paths into segments and convert to numbers
  const segmentsA = pathA.split(".").map(Number);
  const segmentsB = pathB.split(".").map(Number);

  // Compare each segment
  const minLength = Math.min(segmentsA.length, segmentsB.length);

  for (let i = 0; i < minLength; i++) {
    if (segmentsA[i] !== segmentsB[i]) {
      return (segmentsA[i] ?? -1) - (segmentsB[i] ?? -1);
    }
  }

  // If all compared segments are equal, the shorter path comes first
  return segmentsA.length - segmentsB.length;
}

/**
 * Sorts an array of categories by their numeric paths
 *
 * @param categories An array of Category objects with path property
 * @returns The same array, sorted by numeric path
 */
export function sortCategoriesByPath<T extends Pick<Category, "path">>(
  categories: T[],
): T[] {
  return [...categories].sort((a, b) => compareNumericPaths(a.path, b.path));
}
