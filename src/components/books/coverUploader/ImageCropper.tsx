import React from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

interface ImageCropperProps {
  imageUrl: string;
  crop: Crop | undefined;
  onCropChange: (crop: Crop) => void;
  onCropComplete: (crop: Crop) => void;
  onCancel: () => void;
  onSave: () => void;
  isUploading: boolean;
  imgRef: React.RefObject<HTMLImageElement>;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export function ImageCropper({
  imageUrl,
  crop,
  onCropChange,
  onCropComplete,
  onCancel,
  onSave,
  isUploading,
  imgRef,
  onImageLoad,
}: Readonly<ImageCropperProps>) {
  return (
    <Card className="space-y-4 p-4">
      <div className="flex justify-center">
        <ReactCrop
          crop={crop}
          onChange={onCropChange}
          onComplete={onCropComplete}
          className="max-h-80"
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Crop preview"
            onLoad={onImageLoad}
            className="max-h-80 max-w-full"
          />
        </ReactCrop>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Save Crop"}
        </Button>
      </div>
    </Card>
  );
}
