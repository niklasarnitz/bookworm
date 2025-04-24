import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import {
  minioClient,
  MINIO_BUCKET_NAME,
  ensureBucketExists,
  getObjectUrl,
} from "~/lib/minio-client";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { z } from "zod";

// Create a schema for crop data validation
const cropDataSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  unit: z.string().optional(),
});

// Image optimization settings
const IMAGE_MAX_HEIGHT = 1500;
const IMAGE_QUALITY = 80;

export async function POST(req: NextRequest) {
  try {
    // Ensure the user is authenticated
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the MinIO bucket exists
    await ensureBucketExists();

    // Get the form data from the request
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // Validate the file
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    // Get file buffer - properly typed to handle ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Using Buffer.from() with type assertion to handle ArrayBufferLike
    const buffer = Buffer.from(arrayBuffer);

    // Get crop data if provided
    const cropDataStr = formData.get("cropData") as string | null;
    let processedBuffer: Buffer = buffer; // Default to original buffer

    try {
      // Start with the original image buffer
      let imageProcessor = sharp(buffer);

      // Apply cropping if crop data is provided and valid
      if (cropDataStr) {
        try {
          console.log("Received crop data:", cropDataStr);
          const parsedData = JSON.parse(cropDataStr) as unknown;
          const cropDataResult = cropDataSchema.safeParse(parsedData);

          if (cropDataResult.success) {
            const cropData = cropDataResult.data;
            console.log("Valid crop data:", cropData);

            // Make sure crop values are all positive non-zero integers
            if (
              cropData.x >= 0 &&
              cropData.y >= 0 &&
              cropData.width > 0 &&
              cropData.height > 0
            ) {
              try {
                // Apply crop to the image processor
                imageProcessor = imageProcessor.extract({
                  left: Math.round(cropData.x),
                  top: Math.round(cropData.y),
                  width: Math.round(cropData.width),
                  height: Math.round(cropData.height),
                });
                console.log("Image cropping applied");
              } catch (sharpError) {
                console.error("Error during image cropping:", sharpError);
                // If sharp extraction fails, restart with original image
                imageProcessor = sharp(buffer);
              }
            } else {
              console.error("Invalid crop dimensions:", cropData);
            }
          } else {
            console.error("Invalid crop data:", cropDataResult.error);
          }
        } catch (error) {
          console.error("Error parsing crop data:", error);
        }
      } else {
        console.log("No crop data provided, using original image");
      }

      // Apply optimizations:
      // 1. Resize to maintain aspect ratio with max height limit
      imageProcessor = imageProcessor.resize({
        height: IMAGE_MAX_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
      });

      // 2. Apply format-specific optimizations based on file type
      const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

      if (fileExt === "jpg" || fileExt === "jpeg") {
        imageProcessor = imageProcessor.jpeg({ quality: IMAGE_QUALITY });
      } else if (fileExt === "png") {
        imageProcessor = imageProcessor.png({ quality: IMAGE_QUALITY });
      } else if (fileExt === "webp") {
        imageProcessor = imageProcessor.webp({ quality: IMAGE_QUALITY });
      } else {
        // For other formats, convert to webp for better compression
        imageProcessor = imageProcessor.webp({ quality: IMAGE_QUALITY });
      }

      // Process the image with all the applied transformations
      processedBuffer = await imageProcessor.toBuffer();
      console.log("Image optimized successfully");
    } catch (imageProcessingError) {
      console.error("Error during image processing:", imageProcessingError);
      // If any optimization fails, fall back to original image
      processedBuffer = buffer;
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop() ?? "jpg";
    const objectName = `covers/${uuidv4()}.${fileExt}`;

    await minioClient.putObject(MINIO_BUCKET_NAME, objectName, processedBuffer);

    // Generate the URL for the uploaded object
    const url = getObjectUrl(objectName);

    return NextResponse.json({
      success: true,
      objectName,
      url,
      etag: "uploaded", // Since we don't use the etag, provide a placeholder
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to upload file", message: errorMessage },
      { status: 500 },
    );
  }
}
