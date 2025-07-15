import { z } from "zod";

export type CropData = {
  x: number;
  y: number;
  width: number;
  height: number;
  unit?: string;
};

export const uploadResponseSchema = z.object({
  success: z.boolean(),
  url: z.string().url(),
  objectName: z.string(),
  etag: z.string(),
});

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadCroppedImage(
  file: File,
  cropData: CropData,
  retries = 3,
): Promise<ImageUploadResult> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("cropData", JSON.stringify(cropData));

      const response = await fetch("/api/upload/cover", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`,
        );
      }

      const rawData = (await response.json()) as unknown;
      const result = uploadResponseSchema.safeParse(rawData);

      if (result.success) {
        return {
          success: true,
          url: result.data.url,
        };
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error(`Upload attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
        };
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000),
      );
    }
  }

  return {
    success: false,
    error: "Upload failed after all retries",
  };
}

export async function processExternalImageUrl(
  url: string,
): Promise<{ blob: Blob; fileName: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const fileName = url.split("/").pop() ?? "cover.jpg";

    return { blob, fileName };
  } catch (error) {
    console.error("Error processing external image:", error);
    return null;
  }
}
