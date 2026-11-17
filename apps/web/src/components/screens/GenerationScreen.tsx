"use client";

import React from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { Product, TryOnJobState } from "@/features/tryon/types";
import { Sparkles, CheckCircle2, Clock, Check, Loader2 } from "lucide-react";

interface GenerationScreenProps {
  customerImageUrl: string;
  selectedProduct: Product;
  jobState: TryOnJobState;
  onCancel?: () => void;
}

export function GenerationScreen({
  customerImageUrl,
  selectedProduct,
  jobState,
  onCancel,
}: GenerationScreenProps) {
  const { t, language } = useTranslation();

  const stepList = [
    { key: "validating", labelKey: "generating.steps.validating" },
    { key: "queued", labelKey: "generating.steps.queued" },
    { key: "processing", labelKey: "generating.steps.processing" },
    { key: "quality_review", labelKey: "generating.steps.quality" },
    { key: "completed", labelKey: "generating.steps.completed" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "validating":
        return 0;
      case "queued":
        return 1;
      case "processing":
        return 2;
      case "quality_review":
        return 3;
      case "completed":
        return 4;
      default:
        return 0;
    }
  };

  const currentIdx = getStepIndex(jobState.status);

  return (
    <div className="relative z-10 min-h-[calc(100vh-68px)] flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background fabric ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#e5b842]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-3xl bg-[#260712] border-2 border-[#e5b842]/40 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 text-center relative z-10">
        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#340c1a] border border-[#e5b842]/30 text-[#e5b842] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Virtual Dressing Room</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#faf5ed]">
            {t("generating.title")}
          </h2>
          <p className="text-sm text-[#d4c2b2] max-w-lg mx-auto">
            {t("generating.subtitle")}
          </p>
        </div>

        {/* Shimmering Silk Drape Visual Preview */}
        <div className="relative flex items-center justify-center gap-6 py-4">
          {/* Customer Thumbnail */}
          <div className="relative w-28 h-40 md:w-36 md:h-52 rounded-2xl overflow-hidden border-2 border-[#e5b842]/40 shadow-xl bg-black">
            <img
              src={customerImageUrl}
              alt="Customer silhouette"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm py-1 text-[10px] text-[#faf5ed] font-medium">
              Your Silhouette
            </div>
          </div>

          {/* Animated Magic Drape Wand / Connection Icon */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#340c1a] border-2 border-[#e5b842] flex items-center justify-center text-[#e5b842] shadow-lg shadow-[#e5b842]/30 animate-pulse">
              <Sparkles className="w-7 h-7" />
            </div>
            {/* Silk Wave shimmer ribbon */}
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#e5b842] to-transparent fabric-shimmer mt-2" />
          </div>

          {/* Saree Thumbnail */}
          <div className="relative w-28 h-40 md:w-36 md:h-52 rounded-2xl overflow-hidden border-2 border-[#e5b842]/40 shadow-xl bg-[#1b040d]">
            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm py-1 text-[10px] text-[#faf5ed] font-medium line-clamp-1 px-1">
              {language === "ta" ? selectedProduct.name_ta : selectedProduct.name}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#d4c2b2]">
            <span className="font-semibold text-[#e5b842]">
              {t(jobState.currentMessageKey)}
            </span>
            <span className="font-mono">{jobState.progressPercent}%</span>
          </div>

          <div className="w-full h-3 bg-[#1b040d] border border-[#e5b842]/30 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full gold-gradient-bg rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${jobState.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stepper Status List */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 text-left">
          {stepList.map((step, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div
                key={step.key}
                className={`p-3 rounded-xl border text-xs flex items-center sm:flex-col sm:items-start gap-2 transition-all ${
                  isCurrent
                    ? "bg-[#340c1a] border-[#e5b842] text-[#faf5ed] shadow-md shadow-[#e5b842]/10"
                    : isDone
                    ? "bg-[#1b040d]/60 border-[#0b533f] text-[#86efac]"
                    : "bg-[#1b040d]/30 border-white/5 text-[#d4c2b2]/40"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? "bg-[#e5b842] text-[#1a040b]"
                      : isDone
                      ? "bg-[#0b533f] text-[#86efac]"
                      : "bg-white/10 text-white/40"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3 h-3 font-bold" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className="font-medium text-[11px] leading-tight">
                  {t(step.labelKey)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Disclaimer / Notice */}
        <p className="text-xs text-[#d4c2b2]/70 pt-2 border-t border-[#e5b842]/20">
          {t("generating.disclaimer")}
        </p>

        {/* Cancel & Return Option */}
        {onCancel && (
          <div className="pt-1">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e5b842]/40 bg-[#1b040d] text-xs font-medium text-[#e5b842] hover:bg-[#340c1a] hover:border-[#e5b842] transition-colors cursor-pointer"
            >
              <span>← Cancel & Choose Another Saree</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
