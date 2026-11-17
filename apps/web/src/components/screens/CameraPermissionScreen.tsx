"use client";

import React from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { CameraDevice, CameraStatus } from "@/features/camera/types";
import { Camera, AlertCircle, RefreshCw, CheckCircle2, Shield, UserCheck, ArrowLeft } from "lucide-react";

interface CameraPermissionScreenProps {
  status: CameraStatus;
  errorMessage: string | null;
  devices: CameraDevice[];
  selectedDeviceId: string;
  onSelectDevice: (deviceId: string) => void;
  onRequestCamera: () => void;
  onUseFallbackSilhouette: () => void;
  onBack?: () => void;
}

export function CameraPermissionScreen({
  status,
  errorMessage,
  devices,
  selectedDeviceId,
  onSelectDevice,
  onRequestCamera,
  onUseFallbackSilhouette,
  onBack,
}: CameraPermissionScreenProps) {
  const { t } = useTranslation();

  const isDenied = status === "denied";
  const isNotFound = status === "not_found";
  const isError = status === "error";

  return (
    <div className="relative z-10 min-h-[calc(100vh-68px)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-[#260712] border-2 border-[#e5b842]/40 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center text-center space-y-6">
        {/* Animated Camera Icon */}
        <div className="w-24 h-24 rounded-full bg-[#340c1a] border-2 border-[#e5b842] flex items-center justify-center text-[#e5b842] shadow-lg shadow-[#e5b842]/20">
          <Camera className="w-12 h-12" />
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#faf5ed]">
            {t("permission.title")}
          </h2>
          <p className="text-base text-[#d4c2b2] leading-relaxed max-w-lg mx-auto">
            {t("permission.desc")}
          </p>
        </div>

        {/* Privacy guarantees */}
        <div className="w-full bg-[#1b040d] border border-[#e5b842]/20 rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2.5 text-xs text-[#faf5ed]">
            <CheckCircle2 className="w-4 h-4 text-[#e5b842]" />
            <span>Zero cloud video streaming — live posture checks run 100% inside this display</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[#faf5ed]">
            <CheckCircle2 className="w-4 h-4 text-[#e5b842]" />
            <span>No still photo is uploaded without your explicit review and consent</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[#faf5ed]">
            <Shield className="w-4 h-4 text-[#e5b842]" />
            <span>Session and images are automatically purged when you finish or walk away</span>
          </div>
        </div>

        {/* Camera Selector (if multiple available) */}
        {devices.length > 1 && (
          <div className="w-full text-left space-y-1.5">
            <label className="text-xs font-medium text-[#e5b842]">
              {t("permission.selectCamera")}
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => onSelectDevice(e.target.value)}
              className="w-full bg-[#1b040d] border border-[#e5b842]/40 rounded-xl px-4 py-3 text-sm text-[#faf5ed] focus:outline-none focus:border-[#e5b842]"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error Troubleshooting Panel */}
        {(isDenied || isNotFound || isError) && (
          <div className="w-full bg-red-950/60 border border-red-500/50 rounded-2xl p-4 text-left flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-red-200">
              <span className="font-bold text-sm text-red-100 block">
                {isDenied
                  ? t("permission.deniedTitle")
                  : isNotFound
                  ? t("permission.notFoundTitle")
                  : "Camera Error"}
              </span>
              <p>
                {errorMessage ||
                  (isDenied
                    ? t("permission.deniedDesc")
                    : isNotFound
                    ? t("permission.notFoundDesc")
                    : "Unable to activate camera.")}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-4 pt-2">
          {onBack && (
            <button
              onClick={onBack}
              className="w-full sm:w-1/3 py-5 rounded-2xl bg-[#340c1a] border border-[#e5b842]/40 text-[#e5b842] font-semibold text-base hover:bg-[#260712] hover:border-[#e5b842] transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={onRequestCamera}
            disabled={status === "requesting"}
            className="flex-1 w-full py-5 rounded-2xl gold-gradient-bg font-serif font-bold text-lg text-[#1a040b] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer touch-manipulation disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${status === "requesting" ? "animate-spin" : ""}`} />
            <span>
              {isDenied || isNotFound || isError
                ? t("permission.retryBtn")
                : t("permission.enableBtn")}
            </span>
          </button>
        </div>

        {/* Hardware Test / Silhouette Fallback */}
        <div className="pt-2 border-t border-[#e5b842]/20 w-full flex items-center justify-between text-xs text-[#d4c2b2]">
          <span>{t("permission.fallbackNotice")}</span>
          <button
            onClick={onUseFallbackSilhouette}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5b842]/40 bg-[#340c1a] text-[#e5b842] hover:bg-[#e5b842] hover:text-[#1a040b] transition-all font-medium cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>{t("positioning.sampleFallback")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
