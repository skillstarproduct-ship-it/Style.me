"use client";

import React from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { X, QrCode, Smartphone, Clock, ShieldCheck } from "lucide-react";

interface QrModalProps {
  sessionId: string;
  onClose: () => void;
}

export function QrModal({ sessionId, onClose }: QrModalProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#260712] border-2 border-[#e5b842]/50 rounded-3xl p-6 md:p-8 shadow-2xl relative select-none text-center space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#d4c2b2]/60 hover:text-[#faf5ed] hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-[#340c1a] border border-[#e5b842] flex items-center justify-center text-[#e5b842]">
            <Smartphone className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#faf5ed]">
            {t("qr.title")}
          </h3>
          <p className="text-xs text-[#d4c2b2]">{t("qr.desc")}</p>
        </div>

        {/* High Contrast Stylized QR Frame */}
        <div className="w-56 h-56 mx-auto bg-white p-4 rounded-2xl shadow-xl border-4 border-[#e5b842] flex flex-col items-center justify-center relative">
          {/* Simulated authentic SVG QR Code Matrix */}
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#160309] fill-current">
            {/* Top-Left Position Finder */}
            <rect x="5" y="5" width="25" height="25" fill="#160309" />
            <rect x="9" y="9" width="17" height="17" fill="white" />
            <rect x="13" y="13" width="9" height="9" fill="#160309" />

            {/* Top-Right Position Finder */}
            <rect x="70" y="5" width="25" height="25" fill="#160309" />
            <rect x="74" y="9" width="17" height="17" fill="white" />
            <rect x="78" y="13" width="9" height="9" fill="#160309" />

            {/* Bottom-Left Position Finder */}
            <rect x="5" y="70" width="25" height="25" fill="#160309" />
            <rect x="9" y="74" width="17" height="17" fill="white" />
            <rect x="13" y="78" width="9" height="9" fill="#160309" />

            {/* Decorative data modules */}
            <rect x="35" y="10" width="8" height="8" />
            <rect x="50" y="12" width="6" height="6" />
            <rect x="40" y="24" width="8" height="8" />
            <rect x="12" y="38" width="8" height="8" />
            <rect x="25" y="42" width="10" height="6" />
            <rect x="45" y="40" width="10" height="10" />
            <rect x="62" y="38" width="8" height="8" />
            <rect x="78" y="42" width="8" height="8" />
            <rect x="35" y="58" width="8" height="8" />
            <rect x="50" y="55" width="8" height="8" />
            <rect x="68" y="58" width="12" height="6" />
            <rect x="42" y="75" width="8" height="8" />
            <rect x="55" y="78" width="8" height="8" />
            <rect x="72" y="72" width="8" height="8" />
            <rect x="85" y="80" width="6" height="6" />
          </svg>

          {/* Center Brand Badge */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-[#160309] text-[#e5b842] text-[9px] font-bold px-2 py-0.5 rounded border border-[#e5b842]">
              ROKEA
            </span>
          </div>
        </div>

        {/* Security & Expiry Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#d4c2b2] bg-[#1b040d] border border-[#e5b842]/20 rounded-xl p-3">
          <Clock className="w-4 h-4 text-[#e5b842] shrink-0" />
          <span>{t("qr.expiryNotice")}</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl gold-gradient-bg font-serif font-bold text-sm text-[#1a040b] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          {t("qr.close")}
        </button>
      </div>
    </div>
  );
}
