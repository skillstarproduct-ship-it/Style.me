"use client";

import React from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { Clock, ShieldAlert } from "lucide-react";

interface InactivityModalProps {
  secondsLeft: number;
  onStay: () => void;
}

export function InactivityModal({ secondsLeft, onStay }: InactivityModalProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      <div className="w-full max-w-lg bg-[#260712] border-2 border-[#e5b842] rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-[#e5b842]/10 border border-[#e5b842]/40 flex items-center justify-center text-[#e5b842]">
          <Clock className="w-10 h-10 animate-spin" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-[#faf5ed]">
            {t("inactivity.title")}
          </h2>
          <p className="text-sm text-[#d4c2b2] leading-relaxed">
            {t("inactivity.warning", { seconds: secondsLeft })}
          </p>
        </div>

        {/* Countdown big number */}
        <div className="text-5xl font-mono font-bold text-[#e5b842] bg-[#1a040b] px-6 py-2 rounded-2xl border border-[#e5b842]/30 shadow-inner">
          {secondsLeft}s
        </div>

        <button
          onClick={onStay}
          className="w-full py-5 rounded-2xl gold-gradient-bg font-bold text-lg text-[#1a040b] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all touch-manipulation cursor-pointer"
        >
          {t("inactivity.stayBtn")}
        </button>
      </div>
    </div>
  );
}
