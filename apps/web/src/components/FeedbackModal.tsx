"use client";

import React, { useState } from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { FeedbackData } from "@/features/session/sessionStore";
import { Star, X, CheckCircle2, MessageSquare } from "lucide-react";

interface FeedbackModalProps {
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => void;
}

export function FeedbackModal({ onClose, onSubmit }: FeedbackModalProps) {
  const { t } = useTranslation();
  const [designFidelity, setDesignFidelity] = useState<number>(4);
  const [draping, setDraping] = useState<number>(4);
  const [identityPreservation, setIdentityPreservation] = useState<number>(5);
  const [issueCategory, setIssueCategory] = useState<string>("border_alignment");
  const [comment, setComment] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      designFidelity,
      draping,
      identityPreservation,
      issueCategory,
      comment,
    });
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const renderStars = (value: number, setValue: (val: number) => void) => {
    return (
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setValue(star)}
            className="p-1 hover:scale-110 transition-transform cursor-pointer"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value
                  ? "fill-[#e5b842] text-[#e5b842]"
                  : "text-[#d4c2b2]/30 fill-transparent"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-[#260712] border-2 border-[#e5b842]/50 rounded-3xl p-6 md:p-8 shadow-2xl relative select-none">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#d4c2b2]/60 hover:text-[#faf5ed] hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#0b533f] text-[#86efac] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#faf5ed]">
              {t("feedback.thanks")}
            </h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e5b842]/10 border border-[#e5b842]/40 flex items-center justify-center text-[#e5b842]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-[#faf5ed]">
                  {t("feedback.title")}
                </h3>
                <p className="text-xs text-[#d4c2b2]">{t("feedback.subtitle")}</p>
              </div>
            </div>

            {/* Ratings */}
            <div className="space-y-3 bg-[#1b040d] border border-[#e5b842]/20 rounded-2xl p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#faf5ed] font-medium">
                  {t("feedback.fidelityLabel")}
                </span>
                {renderStars(designFidelity, setDesignFidelity)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#faf5ed] font-medium">
                  {t("feedback.drapingLabel")}
                </span>
                {renderStars(draping, setDraping)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#faf5ed] font-medium">
                  {t("feedback.identityLabel")}
                </span>
                {renderStars(identityPreservation, setIdentityPreservation)}
              </div>
            </div>

            {/* Issue Category */}
            <div className="space-y-1.5 text-xs text-left">
              <label className="font-medium text-[#e5b842]">
                {t("feedback.issueCategory")}
              </label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                className="w-full bg-[#1b040d] border border-[#e5b842]/30 rounded-xl px-4 py-3 text-sm text-[#faf5ed] focus:outline-none focus:border-[#e5b842]"
              >
                <option value="border_alignment">Border & Zari Alignment</option>
                <option value="pallu_direction">Pallu Placement & Pleats</option>
                <option value="color_fidelity">Color & Fabric Texture Mismatch</option>
                <option value="silhouette_preservation">Face / Posture Distortion</option>
                <option value="other">Other Boutique Detail</option>
              </select>
            </div>

            {/* Comment */}
            <div className="space-y-1.5 text-xs text-left">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder={t("feedback.commentPlaceholder")}
                className="w-full bg-[#1b040d] border border-[#e5b842]/30 rounded-xl p-3 text-sm text-[#faf5ed] placeholder-[#d4c2b2]/40 focus:outline-none focus:border-[#e5b842]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-4 rounded-xl border border-[#e5b842]/30 text-sm font-medium text-[#faf5ed] hover:bg-white/5 transition-colors cursor-pointer"
              >
                {t("feedback.cancel")}
              </button>
              <button
                type="submit"
                className="w-2/3 py-4 rounded-xl gold-gradient-bg font-serif font-bold text-sm text-[#1a040b] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                {t("feedback.submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
