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
import { db } from "~/server/db";

// Image optimization settings for avatars
const AVATAR_MAX_SIZE = 500; // Maximum width/height
const AVATAR_QUALITY = 80;

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

    // Get file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let processedBuffer: Buffer = buffer;

    try {
      // Process image with sharp
      let imageProcessor = sharp(buffer);

      // Resize the image to a reasonable avatar size and make it square
      imageProcessor = imageProcessor.resize({
        width: AVATAR_MAX_SIZE,
        height: AVATAR_MAX_SIZE,
        fit: "cover", // Crop to fill the dimensions (important for avatars)
        position: "center",
      });

      // Apply format-specific optimizations
      const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

      if (fileExt === "jpg" || fileExt === "jpeg") {
        imageProcessor = imageProcessor.jpeg({ quality: AVATAR_QUALITY });
      } else if (fileExt === "png") {
        imageProcessor = imageProcessor.png({ quality: AVATAR_QUALITY });
      } else if (fileExt === "webp") {
        imageProcessor = imageProcessor.webp({ quality: AVATAR_QUALITY });
      } else {
        // For other formats, convert to webp
        imageProcessor = imageProcessor.webp({ quality: AVATAR_QUALITY });
      }

      // Process the image with all transformations
      processedBuffer = await imageProcessor.toBuffer();
      console.log("Avatar image optimized successfully");
    } catch (imageProcessingError) {
      console.error("Error during image processing:", imageProcessingError);
      // If any optimization fails, fall back to original image
      processedBuffer = buffer;
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop() ?? "jpg";
    const objectName = `avatars/${session.user.id}-${uuidv4()}.${fileExt}`;

    // Upload to MinIO
    await minioClient.putObject(MINIO_BUCKET_NAME, objectName, processedBuffer);

    // Generate the URL for the uploaded object
    const url = getObjectUrl(objectName);

    // Update the user's avatar URL in the database
    await db.user.update({
      where: { id: session.user.id },
      data: { image: url },
    });

    return NextResponse.json({
      success: true,
      objectName,
      url,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to upload avatar", message: errorMessage },
      { status: 500 },
    );
  }
}
