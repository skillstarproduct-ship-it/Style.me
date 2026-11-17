"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CameraStatus, CameraDevice } from "./types";

export function useCamera() {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Enumerate video devices
  const refreshDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return;
      }
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices
        .filter((device) => device.kind === "videoinput")
        .map((device, idx) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${idx + 1}`,
        }));
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (e) {
      console.warn("Failed to enumerate camera devices", e);
    }
  }, [selectedDeviceId]);

  // Stop active stream cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
  }, []);

  // Start camera stream
  const startCamera = useCallback(
    async (deviceIdOverride?: string) => {
      stopCamera();
      setStatus("requesting");
      setErrorMessage(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus("error");
        setErrorMessage("Camera API is not supported in this browser or insecure context.");
        return;
      }

      const deviceIdToUse = deviceIdOverride || selectedDeviceId;

      // Prefer high resolution 1080p / 4K landscape capture for kiosk display
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceIdToUse ? { exact: deviceIdToUse } : undefined,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          facingMode: "user",
          frameRate: { ideal: 30, min: 15 },
        },
        audio: false,
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn("Autoplay was interrupted:", playErr);
          }
        }

        setStatus("active");
        await refreshDevices();
      } catch (err: any) {
        console.error("Camera access error:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setStatus("denied");
          setErrorMessage("Camera access permission was denied. Please allow camera access in browser permissions.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setStatus("not_found");
          setErrorMessage("No camera hardware detected. Please connect a USB camera.");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setStatus("error");
          setErrorMessage("Camera is currently in use by another application or disconnected.");
        } else {
          setStatus("error");
          setErrorMessage(err.message || "Unable to access camera.");
        }
      }
    },
    [selectedDeviceId, stopCamera, refreshDevices]
  );

  // Switch to specific device
  const switchDevice = useCallback(
    (newDeviceId: string) => {
      setSelectedDeviceId(newDeviceId);
      startCamera(newDeviceId);
    },
    [startCamera]
  );

  // Listen for device changes (unplugged or plugged in)
  useEffect(() => {
    refreshDevices();
    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", refreshDevices);
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", refreshDevices);
      };
    }
  }, [refreshDevices]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    status,
    errorMessage,
    devices,
    selectedDeviceId,
    videoRef,
    streamRef,
    startCamera,
    stopCamera,
    switchDevice,
    refreshDevices,
  };
}
