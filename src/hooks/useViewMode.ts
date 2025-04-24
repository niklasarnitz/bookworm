import { useLocalStorage } from "./useLocalStorage";
import { type ViewMode, viewModeSchema } from "~/schemas/book";

/**
 * Custom hook for managing the book view mode with localStorage persistence
 * @param defaultMode The default view mode to use
 * @returns A tuple with the current view mode and a setter function
 */
export function useViewMode(
  defaultMode: ViewMode = "grid",
): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewModeState] = useLocalStorage<ViewMode>(
    "bookworm-view-mode",
    defaultMode,
  );

  const setViewMode = (mode: ViewMode) => {
    try {
      // Validate the view mode
      const parsedMode = viewModeSchema.parse(mode);
      setViewModeState(parsedMode);
    } catch (error) {
      console.error("Invalid view mode:", error);
    }
  };

  return [viewMode, setViewMode];
}
