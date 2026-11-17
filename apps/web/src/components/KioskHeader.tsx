"use client";

import React from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { KioskStep } from "@/features/session/sessionStore";
import { Camera, Volume2, VolumeX, RotateCcw, ArrowLeft } from "lucide-react";

interface KioskHeaderProps {
  currentStep: KioskStep;
  isCameraActive: boolean;
  onResetSession: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onGoBack?: () => void;
  onSelectStep?: (step: KioskStep) => void;
}

export function KioskHeader({
  currentStep,
  isCameraActive,
  onResetSession,
  isMuted,
  onToggleMute,
  onGoBack,
  onSelectStep,
}: KioskHeaderProps) {
  const { t } = useTranslation();

  const steps: { key: KioskStep; labelKey: string }[] = [
    { key: "catalog", labelKey: "nav.step1" },
    { key: "positioning", labelKey: "nav.step2" },
    { key: "confirm", labelKey: "nav.step3" },
    { key: "generating", labelKey: "nav.step4" },
    { key: "result", labelKey: "nav.step5" },
  ];

  const getStepIndex = (step: KioskStep) => {
    switch (step) {
      case "welcome":
        return -1;
      case "catalog":
        return 0;
      case "permission":
      case "positioning":
        return 1;
      case "confirm":
        return 2;
      case "generating":
        return 3;
      case "result":
        return 4;
    }
  };

  const activeIndex = getStepIndex(currentStep);

  return (
    <header className="w-full bg-[#1b040d]/90 backdrop-blur-md border-b border-[#e5b842]/30 px-6 py-3.5 flex items-center justify-between z-30 select-none">
      {/* Brand & Subtitle & Back Button */}
      <div className="flex items-center gap-4">
        {currentStep !== "welcome" && onGoBack && (
          <button
            onClick={onGoBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e5b842]/40 bg-[#340c1a]/80 text-[#e5b842] text-xs font-semibold hover:bg-[#e5b842] hover:text-[#1a040b] transition-all cursor-pointer shadow-md"
            title="Go Back to Previous Page"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif font-bold tracking-wider gold-gradient-text drop-shadow-[0_0_10px_rgba(229,184,66,0.45)] drop-shadow-[0_0_20px_rgba(251,226,141,0.25)]">
              ROKEA
            </span>
          </div>
          <span className="text-[11px] text-[#d4c2b2] tracking-wide font-light hidden sm:block">
            {t("tagline")}
          </span>
        </div>

        {/* Camera Active Indicator */}
        {isCameraActive && (
          <div className="flex items-center gap-2 bg-[#0b533f]/40 border border-[#0b533f] text-[#86efac] text-xs px-3 py-1 rounded-full animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span className="font-medium hidden md:inline">{t("nav.cameraActive")}</span>
          </div>
        )}
      </div>

      {/* Step Indicator (visible during active journey with click-to-navigate) */}
      {currentStep !== "welcome" && (
        <nav className="hidden lg:flex items-center gap-2">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            return (
              <div key={step.key} className="flex items-center">
                <button
                  type="button"
                  disabled={!isCompleted || !onSelectStep}
                  onClick={() => isCompleted && onSelectStep && onSelectStep(step.key)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                    isCurrent
                      ? "bg-[#e5b842] text-[#1a040b] font-bold shadow-md shadow-[#e5b842]/20 cursor-default"
                      : isCompleted
                      ? "text-[#e5b842] font-medium hover:bg-[#e5b842]/15 hover:scale-105 cursor-pointer"
                      : "text-[#d4c2b2]/40 cursor-default"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isCurrent
                        ? "bg-[#1a040b] text-[#e5b842]"
                        : isCompleted
                        ? "bg-[#e5b842]/20 text-[#e5b842]"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span>{t(step.labelKey)}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-6 h-[1px] mx-1 ${
                      isCompleted ? "bg-[#e5b842]/60" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </nav>
      )}

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleMute}
          className="p-2 rounded-lg border border-[#e5b842]/30 bg-[#340c1a]/40 text-[#faf5ed]/80 hover:text-[#e5b842] transition-colors"
          title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Finish / Reset Session */}
        {currentStep !== "welcome" && (
          <button
            onClick={onResetSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-950/40 text-red-200 text-xs font-medium hover:bg-red-900/50 hover:border-red-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("nav.finishSession")}</span>
          </button>
        )}
      </div>
    </header>
  );
}
