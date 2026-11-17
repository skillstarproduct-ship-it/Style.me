"use client";

import React from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { FramingStatus } from "@/features/camera/types";
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Sparkles,
  User,
  Sun,
  Activity,
  UserCheck,
  ArrowLeft,
} from "lucide-react";

interface LivePositioningScreenProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  framingStatus: FramingStatus;
  countdownRemaining: number | null;
  stabilityProgress: number;
  onManualCapture: () => void;
  onSwitchCamera?: () => void;
  onUseFallbackSilhouette: () => void;
  isModelLoading: boolean;
  modelError: string | null;
  onBack?: () => void;
}

export function LivePositioningScreen({
  videoRef,
  framingStatus,
  countdownRemaining,
  stabilityProgress,
  onManualCapture,
  onSwitchCamera,
  onUseFallbackSilhouette,
  isModelLoading,
  modelError,
  onBack,
}: LivePositioningScreenProps) {
  const { t } = useTranslation();

  const isPerfect = framingStatus.isFramingPerfect;

  // Render status chip with icon
  const renderChip = (
    label: string,
    isGood: boolean,
    isWarning = false,
    textOverride?: string
  ) => {
    return (
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          isGood
            ? "bg-[#0b533f]/80 border border-[#22c55e]/60 text-[#86efac]"
            : isWarning
            ? "bg-amber-950/70 border border-amber-500/60 text-amber-300"
            : "bg-red-950/70 border border-red-500/60 text-red-300"
        }`}
      >
        {isGood ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : isWarning ? (
          <AlertTriangle className="w-3.5 h-3.5" />
        ) : (
          <XCircle className="w-3.5 h-3.5" />
        )}
        <span>{label}:</span>
        <span className="font-semibold">
          {textOverride || (isGood ? "OK" : isWarning ? "Adjust" : "Check")}
        </span>
      </div>
    );
  };

  return (
    <div className="relative z-10 min-h-[calc(100vh-68px)] flex flex-col items-center justify-between p-4 md:p-6 select-none">
      {/* Top Guidance Bar */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-3 bg-[#260712]/90 border border-[#e5b842]/30 rounded-2xl p-4 shadow-xl z-20">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isPerfect
                ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]"
                : "bg-[#e5b842]/20 text-[#e5b842] border border-[#e5b842]"
            }`}
          >
            {isPerfect ? <CheckCircle2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base md:text-lg font-serif font-bold text-[#faf5ed]">
              {t("positioning.title")}
            </h3>
            <p
              className={`text-sm font-medium ${
                isPerfect ? "text-[#86efac]" : "text-[#e5b842]"
              }`}
            >
              {t(`positioning.guidance.${framingStatus.guidanceKey}`)}
            </p>
          </div>
        </div>

        {/* Guidance Status Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {renderChip(
            t("positioning.chips.person"),
            framingStatus.hasPerson && !framingStatus.multiplePeople,
            framingStatus.multiplePeople,
            framingStatus.multiplePeople ? "Multiple" : framingStatus.hasPerson ? "Single" : "None"
          )}
          {renderChip(t("positioning.chips.head"), framingStatus.headInFrame)}
          {renderChip(t("positioning.chips.feet"), framingStatus.feetInFrame)}
          {renderChip(
            t("positioning.chips.distance"),
            framingStatus.distanceStatus === "optimal",
            framingStatus.distanceStatus !== "optimal",
            framingStatus.distanceStatus === "optimal"
              ? "Good"
              : framingStatus.distanceStatus === "too_close"
              ? "Too Close"
              : "Too Far"
          )}
          {renderChip(
            t("positioning.chips.lighting"),
            framingStatus.lightingStatus === "good",
            framingStatus.lightingStatus !== "good",
            framingStatus.lightingStatus === "good" ? "Clear" : "Low"
          )}
          {renderChip(
            t("positioning.chips.stability"),
            framingStatus.isSteady,
            !framingStatus.isSteady,
            framingStatus.isSteady ? "Steady" : "Moving"
          )}
        </div>
      </div>

      {/* Hero Camera Viewport with Framing Guide Silhouette */}
      <div className="relative w-full max-w-5xl my-auto aspect-[16/10] md:aspect-[16/9] bg-black rounded-3xl overflow-hidden border-2 shadow-2xl zari-border flex items-center justify-center">
        {/* Live Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="w-full h-full object-cover transform -scale-x-100" // Mirror view for natural kiosk dressing mirror feel
        />

        {/* Full-Body Silhouette Outline Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
          <div
            className={`relative w-[48%] h-[92%] rounded-[48px] border-2 transition-all duration-300 flex flex-col items-center justify-between p-4 ${
              isPerfect
                ? "border-[#22c55e] shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                : "border-[#e5b842]/70 shadow-[0_0_20px_rgba(229,184,66,0.2)]"
            }`}
          >
            {/* Crown / Head Placement Bracket */}
            <div
              className={`w-32 h-20 rounded-full border-t-2 border-dashed flex items-center justify-center transition-colors ${
                framingStatus.headInFrame ? "border-[#22c55e]" : "border-[#e5b842]"
              }`}
            >
              <span className="text-[10px] tracking-wider uppercase font-bold text-[#faf5ed]/60 bg-black/40 px-2 py-0.5 rounded">
                HEAD ZONE
              </span>
            </div>

            {/* Torso Center Marker */}
            <div className="w-16 h-16 rounded-full border border-dashed border-[#e5b842]/40 flex items-center justify-center">
              <div
                className={`w-2 h-2 rounded-full ${
                  framingStatus.isCentered ? "bg-[#22c55e]" : "bg-[#e5b842]"
                }`}
              />
            </div>

            {/* Feet Placement Bracket */}
            <div
              className={`w-40 h-16 rounded-t-xl border-b-2 border-dashed flex items-center justify-center transition-colors ${
                framingStatus.feetInFrame ? "border-[#22c55e]" : "border-[#e5b842]"
              }`}
            >
              <span className="text-[10px] tracking-wider uppercase font-bold text-[#faf5ed]/60 bg-black/40 px-2 py-0.5 rounded">
                FEET ZONE
              </span>
            </div>
          </div>
        </div>

        {/* Floating Countdown Ring Overlay when Posture is Perfect */}
        {countdownRemaining !== null && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-30">
            <div className="relative flex items-center justify-center">
              {/* Circular SVG Progress */}
              <svg className="w-48 h-48 -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#22c55e"
                  strokeWidth="10"
                  strokeDasharray="502"
                  strokeDashoffset={502 - (502 * stabilityProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-100 ease-linear"
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="text-6xl font-bold font-mono text-[#faf5ed] drop-shadow-md">
                  {countdownRemaining}
                </span>
                <span className="text-xs uppercase tracking-widest text-[#22c55e] font-bold">
                  HOLD STILL
                </span>
              </div>
            </div>
          </div>
        )}

        {/* MediaPipe Model Status Badge */}
        {isModelLoading && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#e5b842]/40 text-xs text-[#e5b842] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e5b842] animate-ping" />
            <span>Calibrating MediaPipe Pose AI...</span>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-3">
        {/* Floor standing instruction */}
        <div className="text-xs text-[#d4c2b2] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e5b842]" />
          <span>{t("positioning.instructions")}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-[#260712] border border-[#e5b842]/40 text-sm font-semibold text-[#e5b842] hover:bg-[#340c1a] transition-all cursor-pointer shadow-md"
              title="Back to Catalog"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          {onSwitchCamera && (
            <button
              onClick={onSwitchCamera}
              className="p-4 rounded-2xl bg-[#260712] border border-[#e5b842]/30 text-[#e5b842] hover:bg-[#340c1a] transition-all cursor-pointer"
              title={t("positioning.switchCamera")}
            >
              <RotateCw className="w-5 h-5" />
            </button>
          )}

          {/* Test silhouette fallback */}
          <button
            onClick={onUseFallbackSilhouette}
            className="flex items-center gap-2 px-4 py-4 rounded-2xl bg-[#260712] border border-[#e5b842]/40 text-xs text-[#e5b842] hover:bg-[#340c1a] transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span className="hidden md:inline">{t("positioning.sampleFallback")}</span>
          </button>

          {/* Large Primary Manual Capture CTA Button (64px+ height) */}
          <button
            onClick={onManualCapture}
            className="flex items-center gap-3 px-8 py-5 rounded-2xl gold-gradient-bg font-serif font-bold text-lg text-[#1a040b] shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer touch-manipulation min-h-[64px]"
          >
            <Camera className="w-6 h-6" />
            <span>{t("positioning.manualCapture")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
