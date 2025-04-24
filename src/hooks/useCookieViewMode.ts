import { useState, useEffect } from "react";
import { type ViewMode, viewModeSchema } from "~/schemas/book";

/**
 * Custom hook for managing the book view mode with cookie persistence
 * @param defaultMode The default view mode to use
 * @returns A tuple with the current view mode and a setter function
 */
export function useCookieViewMode(
  defaultMode: ViewMode = "grid",
): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewModeState] = useState<ViewMode>(defaultMode);

  // Read the cookie on initial render
  useEffect(() => {
    try {
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("bookworm-view-mode="))
        ?.split("=")[1];

      if (cookieValue) {
        const parsedValue = cookieValue as ViewMode;
        if (viewModeSchema.safeParse(parsedValue).success) {
          setViewModeState(parsedValue);
        }
      }
    } catch (error) {
      console.error("Error reading cookie:", error);
    }
  }, []);

  // Function to update the view mode and save to cookie
  const setViewMode = (mode: ViewMode) => {
    try {
      // Validate the view mode
      const parsedMode = viewModeSchema.parse(mode);

      // Update state
      setViewModeState(parsedMode);

      // Save to cookie (30 days expiry)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      document.cookie = `bookworm-view-mode=${parsedMode}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    } catch (error) {
      console.error("Invalid view mode:", error);
    }
  };

  return [viewMode, setViewMode];
}
