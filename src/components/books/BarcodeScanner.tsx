import { useState, useEffect, useCallback, useRef } from "react";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { useZxing } from "react-zxing";
import { useMediaDevices } from "react-media-devices";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { X, CameraOff, RefreshCw } from "lucide-react";

interface BarcodeScannerProps {
  onScanComplete: (isbn: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({
  onScanComplete,
  onClose,
}: Readonly<BarcodeScannerProps>) {
  const [result, setResult] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(
    undefined,
  );
  const [manualIsbn, setManualIsbn] = useState<string>("");
  const [cameraPaused, setCameraPaused] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Define the base constraints for video
  const constraints: MediaStreamConstraints = {
    video: true,
    audio: false,
  };

  // Use the useMediaDevices hook to get available camera devices
  const { devices, loading: devicesLoading } = useMediaDevices({
    constraints,
  });

  // Set the first available camera device as default when devices are loaded
  useEffect(() => {
    if (devices && devices.length > 0 && !selectedDeviceId) {
      // Prefer back camera (environment facing) on mobile devices
      const backCamera = devices.find(
        (device) =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("rear"),
      );

      setSelectedDeviceId(backCamera?.deviceId ?? devices[0]?.deviceId);
    }
  }, [devices, selectedDeviceId]);

  // Setup barcode scanning hints
  const hints = new Map<DecodeHintType, unknown>();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_128,
    BarcodeFormat.UPC_A, // Sometimes used in books
    BarcodeFormat.UPC_E, // Sometimes used in books
  ]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  hints.set(DecodeHintType.ASSUME_GS1, true); // Better commercial barcode detection

  // Use zxing hook with the selected device
  const { ref } = useZxing({
    hints,
    deviceId: selectedDeviceId!,
    paused: !selectedDeviceId || cameraPaused,
    timeBetweenDecodingAttempts: 150,
    onError: (error: unknown) => {
      console.error("Barcode scanning error:", error);

      if (error instanceof Error) {
        setCameraError(`Failed to access camera: ${error.message}`);
      }
    },
    onDecodeResult(result) {
      const text = result.getText();

      // Take a snapshot of the current frame
      if (ref.current && canvasRef.current && !cameraPaused) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (context) {
          // Set canvas dimensions to match video
          canvas.width = ref.current.videoWidth;
          canvas.height = ref.current.videoHeight;

          // Draw the current frame to the canvas
          context.drawImage(ref.current, 0, 0, canvas.width, canvas.height);

          // Pause the camera stream
          setCameraPaused(true);
        }
      }

      setResult(text);
      console.log("Detected barcode:", text);

      // ISBN-13 starts with 978 or 979 and has 13 digits
      // ISBN-10 has 10 digits (or 9 digits + X)
      const isIsbn13 = /^(978|979)\d{10}$/.test(text);
      const isIsbn10 = /^\d{9}[\dX]$/.test(text);

      // Accept any valid ISBN format
      if (isIsbn13 || isIsbn10) {
        setIsValid(true);
      } else if (/^\d{10,13}$/.test(text)) {
        // If it's a numeric-only code with length 10-13, it might be an ISBN with some issues
        setIsValid(true);
      } else {
        setIsValid(false);
        // If invalid, don't pause the camera - continue scanning
        setCameraPaused(false);
      }
    },
  });

  const handleAccept = useCallback(() => {
    if (result && isValid) {
      console.log("Using ISBN:", result);

      // Make sure to explicitly call onScanComplete with the result
      onScanComplete(result);

      // Clean up by closing the dialog after accepting the result
      setIsOpen(false);
    }
  }, [result, isValid, onScanComplete]);

  const handleDialogClose = useCallback(() => {
    setIsOpen(false);
    onClose();
  }, [onClose]);

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    // Reset state when changing camera
    setResult("");
    setIsValid(false);
    setCameraPaused(false);
  };

  const handleResetScan = () => {
    setResult("");
    setIsValid(false);
    setCameraPaused(false);
  };

  useEffect(() => {
    // If we have a valid barcode, automatically accept it after a short delay
    let timeout: NodeJS.Timeout;
    if (isValid) {
      timeout = setTimeout(() => {
        handleAccept();
      }, 1500); // 1.5 second delay to show the result to the user
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isValid, handleAccept]);

  const handleManualSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (manualIsbn) {
      // Clean input of spaces, dashes, etc.
      const cleanIsbn = manualIsbn.replace(/[^0-9X]/gi, "");
      setResult(cleanIsbn);

      // Validate the ISBN format
      const isIsbn13 = /^(978|979)\d{10}$/.test(cleanIsbn);
      const isIsbn10 = /^\d{9}[\dX]$/.test(cleanIsbn);

      if (isIsbn13 || isIsbn10 || /^\d{10,13}$/.test(cleanIsbn)) {
        setIsValid(true);
      }
    }
  };

  // Determine if there's an error with device access
  const hasError =
    !!cameraError || (!devicesLoading && (!devices || devices.length === 0));

  // Get the error message to display
  const getErrorMessage = (): string => {
    if (cameraError) return cameraError;
    if (!devices || devices.length === 0)
      return "No camera devices found on your device.";
    return "Unable to access the camera.";
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) handleDialogClose();
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={handleDialogClose}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Scan ISBN Barcode
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleDialogClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogTitle>
          <DialogDescription>
            Position the ISBN barcode within the camera view
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-64 w-full overflow-hidden rounded-md border bg-black">
            {/* Loading state */}
            {devicesLoading && (
              <div className="bg-opacity-60 absolute inset-0 flex items-center justify-center bg-black text-white">
                <div className="flex flex-col items-center">
                  <div className="mb-2 h-8 w-8 animate-spin rounded-full border-t-2 border-white"></div>
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}

            {/* Show error message */}
            {hasError && (
              <div className="bg-opacity-60 absolute inset-0 flex items-center justify-center bg-black text-white">
                <div className="flex flex-col items-center p-4 text-center">
                  <CameraOff className="mb-2 h-12 w-12" />
                  <p className="mb-4">{getErrorMessage()}</p>
                </div>
              </div>
            )}

            {/* Canvas for capturing frozen frames - show when paused */}
            {cameraPaused && (
              <canvas
                ref={canvasRef}
                className="absolute h-full w-full object-cover"
              />
            )}

            {/* Video element - hide when paused */}
            <video
              ref={ref}
              className={`absolute h-full w-full object-cover ${cameraPaused ? "hidden" : ""}`}
              autoPlay
              playsInline
              muted
            />

            {/* Scanning frame */}
            {!hasError && selectedDeviceId && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`border-2 ${
                    isValid ? "border-green-500" : "border-white"
                  } h-32 w-80 rounded-md opacity-50`}
                />

                {/* Add scanning animation when not paused */}
                {!cameraPaused && !isValid && (
                  <div
                    className="absolute h-0.5 w-72 bg-white opacity-80"
                    style={{
                      animation: "scan-line 2s linear infinite",
                    }}
                  />
                )}
              </div>
            )}

            {/* Reset scan button - only show when camera is paused */}
            {cameraPaused && isValid && (
              <div className="absolute right-2 bottom-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-opacity-60 hover:bg-opacity-80 bg-black text-white hover:bg-black"
                  onClick={handleResetScan}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Rescan
                </Button>
              </div>
            )}
          </div>

          {/* CSS for scan line animation */}
          <style jsx global>{`
            @keyframes scan-line {
              0% {
                transform: translateY(-40px);
              }
              50% {
                transform: translateY(40px);
              }
              100% {
                transform: translateY(-40px);
              }
            }
          `}</style>

          {/* Camera device selector - only show if multiple cameras available */}
          {devices && devices.length > 1 && (
            <div className="w-full">
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="camera-select"
              >
                Select camera
              </label>
              <select
                id="camera-select"
                className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800"
                onChange={(e) => handleSelectDevice(e.target.value)}
                value={selectedDeviceId}
              >
                {devices.map((device, index) => (
                  <option
                    key={`${device.deviceId}-${index}`}
                    value={device.deviceId}
                  >
                    {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Result display */}
          {result && (
            <div className="text-center">
              <p className="mb-1 font-medium">Detected code:</p>
              <p
                className={`text-xl font-bold ${
                  isValid ? "text-green-600" : "text-red-600"
                }`}
              >
                {result}
              </p>
              {!isValid && (
                <p className="mt-1 text-sm text-red-500">
                  This doesn&apos;t appear to be a valid ISBN barcode
                </p>
              )}
            </div>
          )}

          {/* Manual ISBN input - show for both error cases and as an alternative */}
          <div className="mt-2 w-full rounded-md border p-4">
            <h4 className="mb-2 font-medium">Enter ISBN manually</h4>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualIsbn}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setManualIsbn(e.target.value)
                }
                placeholder="e.g., 9781234567890"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
              <Button type="submit">Use</Button>
            </form>
            <p className="mt-2 text-xs text-gray-500">
              {hasError
                ? "Camera access isn't working. You can type the ISBN manually."
                : "You can also enter the ISBN manually if scanning is difficult."}
            </p>
          </div>

          <div className="flex w-full justify-between">
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleAccept} disabled={!result || !isValid}>
              Use This ISBN
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
