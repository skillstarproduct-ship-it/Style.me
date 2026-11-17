"use client";

import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { Product } from "@/features/tryon/types";
import {
  Sparkles,
  RotateCcw,
  MessageSquareWarning,
  QrCode,
  ArrowRight,
  Info,
  CheckCircle2,
  Sliders,
  ArrowLeft,
} from "lucide-react";

interface ResultScreenProps {
  customerImageUrl: string;
  resultImageUrl: string;
  selectedProduct: Product;
  onTryAnotherSaree: () => void;
  onReportFeedback: () => void;
  onOpenQr: () => void;
  onFinishSession: () => void;
}

export function ResultScreen({
  customerImageUrl,
  resultImageUrl,
  selectedProduct,
  onTryAnotherSaree,
  onReportFeedback,
  onOpenQr,
  onFinishSession,
}: ResultScreenProps) {
  const { t, language } = useTranslation();
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 to 100
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Handle slider drag interaction
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percent = (clampedX / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="relative z-10 min-h-[calc(100vh-68px)] flex flex-col justify-between p-4 md:p-8 select-none">
      {/* Top Title Banner */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b533f]/50 border border-[#22c55e]/40 text-[#86efac] text-xs font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Virtual Draping Complete</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#faf5ed]">
            {t("result.title")}
          </h2>
          <p className="text-xs md:text-sm text-[#e5b842] flex items-center gap-1.5 mt-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>{t("result.sliderHint")}</span>
          </p>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTryAnotherSaree}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#260712] border border-[#e5b842]/40 text-sm font-medium text-[#e5b842] hover:bg-[#340c1a] transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Catalog</span>
          </button>

          <button
            onClick={onOpenQr}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#260712] border border-[#e5b842]/40 text-sm font-medium text-[#e5b842] hover:bg-[#340c1a] transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>{t("result.qrPhone")}</span>
          </button>

          <button
            onClick={onReportFeedback}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#260712] border border-[#e5b842]/40 text-sm font-medium text-[#faf5ed] hover:bg-[#340c1a] transition-all cursor-pointer"
          >
            <MessageSquareWarning className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{t("result.reportIssue")}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Before/After Slider + Saree Specs */}
      <div className="w-full max-w-7xl mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Interactive Before / After Comparison Slider */}
        <div className="lg:col-span-8 flex justify-center">
          <div
            ref={containerRef}
            onMouseDown={() => (isDraggingRef.current = true)}
            onMouseUp={() => (isDraggingRef.current = false)}
            onMouseLeave={() => (isDraggingRef.current = false)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative aspect-[9/16] h-[520px] md:h-[600px] rounded-3xl overflow-hidden border-2 border-[#e5b842] shadow-2xl zari-border bg-black cursor-ew-resize select-none"
          >
            {/* After Image (Full width base) */}
            <img
              src={resultImageUrl}
              alt="Generated Saree Result"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#e5b842]/50 text-xs font-bold text-[#e5b842] pointer-events-none">
              {t("result.after")}
            </div>

            {/* Before Image (Clipped on the left based on slider position) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={customerImageUrl}
                alt="Original Customer Capture"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none max-w-none"
                style={{
                  width: containerRef.current
                    ? `${containerRef.current.clientWidth}px`
                    : "100%",
                }}
              />
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold text-[#faf5ed] pointer-events-none">
                {t("result.before")}
              </div>
            </div>

            {/* Draggable Divider Line & Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#e5b842] shadow-[0_0_15px_rgba(229,184,66,0.8)] pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full gold-gradient-bg border-2 border-[#1a040b] shadow-xl flex items-center justify-center text-[#1a040b] font-bold text-xs pointer-events-auto cursor-ew-resize">
                ⇄
              </div>
            </div>
          </div>
        </div>

        {/* Saree Boutique Details & Disclaimers */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6 bg-[#260712] border border-[#e5b842]/30 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[#e5b842] bg-[#1b040d] shrink-0">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#e5b842] font-bold">
                  {selectedProduct.sku}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#faf5ed] line-clamp-2">
                  {language === "ta" ? selectedProduct.name_ta : selectedProduct.name}
                </h3>
              </div>
            </div>

            <div className="text-2xl font-serif font-bold gold-gradient-text pt-2 border-t border-[#e5b842]/20">
              ₹ {selectedProduct.price.toLocaleString("en-IN")}
            </div>

            {/* Spec Attributes */}
            <div className="space-y-2.5 text-xs bg-[#1b040d] border border-[#e5b842]/20 rounded-2xl p-4">
              <div className="flex justify-between">
                <span className="text-[#d4c2b2]/60">{t("catalog.fabric")}:</span>
                <span className="text-[#faf5ed] font-medium text-right max-w-[60%]">
                  {language === "ta" ? selectedProduct.fabric_ta : selectedProduct.fabric}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#d4c2b2]/60">{t("catalog.origin")}:</span>
                <span className="text-[#faf5ed] font-medium">
                  {language === "ta" ? selectedProduct.origin_ta : selectedProduct.origin}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#d4c2b2]/60">{t("catalog.pallu")}:</span>
                <span className="text-[#faf5ed] font-medium text-right max-w-[60%]">
                  {language === "ta"
                    ? selectedProduct.pallu_details_ta
                    : selectedProduct.pallu_details}
                </span>
              </div>
            </div>

            {/* Mandatory Disclaimers */}
            <div className="bg-[#20040c] border border-[#e5b842]/20 rounded-2xl p-3 text-[11px] text-[#d4c2b2] flex items-start gap-2.5 leading-relaxed">
              <Info className="w-4 h-4 text-[#e5b842] shrink-0 mt-0.5" />
              <span>{t("result.disclaimer")}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-[#e5b842]/20">
            {/* Try Another Saree (reuses same confirmed capture) */}
            <button
              onClick={onTryAnotherSaree}
              className="w-full py-5 rounded-2xl gold-gradient-bg font-serif font-bold text-lg text-[#1a040b] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer touch-manipulation min-h-[64px]"
            >
              <Sparkles className="w-5 h-5 text-[#1a040b]" />
              <span>{t("result.tryAnother")}</span>
            </button>

            {/* Finish & Reset Session */}
            <button
              onClick={onFinishSession}
              className="w-full py-4 rounded-2xl bg-[#340c1a] border border-[#e5b842]/40 text-[#faf5ed] font-semibold text-sm hover:bg-red-950/60 hover:border-red-400 hover:text-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t("result.finish")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
