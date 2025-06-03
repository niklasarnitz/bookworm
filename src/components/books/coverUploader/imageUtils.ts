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
): Promise<ImageUploadResult> {
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
      console.error("Invalid response format:", rawData);
      return {
        success: false,
        error: "Upload failed: Invalid server response",
      };
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      error: "Error uploading image. Please try again.",
    };
  }
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
