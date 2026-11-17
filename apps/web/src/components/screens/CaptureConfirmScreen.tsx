"use client";

import React from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { CapturedImageMeta } from "@/features/session/sessionStore";
import { Check, RotateCcw, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

interface CaptureConfirmScreenProps {
  capturedImageUrl: string;
  capturedMeta: CapturedImageMeta | null;
  onRetake: () => void;
  onConfirm: () => void;
  onBackToCatalog?: () => void;
}

export function CaptureConfirmScreen({
  capturedImageUrl,
  capturedMeta,
  onRetake,
  onConfirm,
  onBackToCatalog,
}: CaptureConfirmScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 min-h-[calc(100vh-68px)] flex flex-col items-center justify-between p-4 md:p-8 select-none">
      {/* Header title */}
      <div className="max-w-3xl text-center space-y-2 mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#0b533f]/50 border border-[#22c55e]/40 text-[#86efac] text-xs font-medium">
          <Check className="w-3.5 h-3.5" />
          <span>Capture Successful</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#faf5ed]">
          {t("confirm.title")}
        </h2>
        <p className="text-sm md:text-base text-[#d4c2b2]">{t("confirm.desc")}</p>
      </div>

      {/* Main Image Review Layout */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto">
        {/* Captured Still Preview Frame */}
        <div className="md:col-span-7 flex justify-center">
          <div className="relative aspect-[9/16] h-[480px] md:h-[540px] rounded-3xl overflow-hidden border-2 border-[#e5b842] shadow-2xl zari-border bg-black">
            <img
              src={capturedImageUrl}
              alt="Captured Customer"
              className="w-full h-full object-cover"
            />
            {/* Resolution Badge */}
            {capturedMeta && (
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-[11px] text-[#faf5ed]/80">
                {capturedMeta.width} × {capturedMeta.height} px
              </div>
            )}
          </div>
        </div>

        {/* Consent & Quality Review Panel */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-6 bg-[#260712] border border-[#e5b842]/30 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e5b842]/10 border border-[#e5b842] flex items-center justify-center text-[#e5b842]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#faf5ed]">
                {t("confirm.consentHeading")}
              </h3>
            </div>

            <p className="text-xs md:text-sm text-[#d4c2b2] leading-relaxed bg-[#1b040d] border border-[#e5b842]/20 rounded-2xl p-4">
              {t("confirm.consentBody")}
            </p>

            <div className="space-y-2 text-xs text-[#faf5ed]/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e5b842]" />
                <span>Single still image sent to dedicated AI draping engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e5b842]" />
                <span>Private & isolated to your active guest session</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e5b842]" />
                <span>Automatic scheduled deletion when you finish</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-[#e5b842]/20">
            <button
              onClick={onConfirm}
              className="w-full py-5 rounded-2xl gold-gradient-bg font-serif font-bold text-lg text-[#1a040b] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer touch-manipulation min-h-[64px]"
            >
              <span>{t("confirm.confirmBtn")}</span>
              <ArrowRight className="w-5 h-5 text-[#1a040b]" />
            </button>

            <button
              onClick={onRetake}
              className="w-full py-4 rounded-2xl bg-[#340c1a] border border-[#e5b842]/40 text-[#e5b842] font-semibold text-sm hover:bg-[#260712] hover:border-[#e5b842] transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t("confirm.retakeBtn")}</span>
            </button>

            {onBackToCatalog && (
              <button
                onClick={onBackToCatalog}
                className="w-full py-3.5 rounded-2xl bg-black/40 border border-[#e5b842]/20 text-[#d4c2b2] hover:text-[#faf5ed] font-medium text-xs hover:border-[#e5b842]/50 transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >
                <span>← Change Saree Selection</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
