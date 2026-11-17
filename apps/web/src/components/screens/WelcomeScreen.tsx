"use client";

import React, { useState } from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { Play, Sparkles, Gem, Shirt } from "lucide-react";
import { SpecularButton } from "@/components/SpecularButton";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { t } = useTranslation();
  const [isPressed, setIsPressed] = useState(false);

  const handleStart = () => {
    if (isPressed) return;
    setIsPressed(true);
    onStart();
    setTimeout(() => {
      setIsPressed(false);
    }, 800);
  };

  return (
    <div className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-[#160309] select-none">
      {/* Royal Rokea Front Page Master Artwork */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/rokea-front-page.jpg"
        alt="Rokea by RK Luxury Saree Virtual Dressing Room"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-transform duration-700"
      />

      {/* Model: slides in butter-smooth from the left after 0.6s */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/rokea-model.png"
        alt="Rokea Luxury Saree Model"
        className="animate-model-slide-in-left absolute bottom-0 left-0 h-[80%] sm:h-[88%] md:h-[92%] w-auto max-w-[42%] sm:max-w-[36%] md:max-w-[30%] object-contain object-bottom pointer-events-none z-10 drop-shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
      />

      {/* Hanging lantern glow enhancer — top-right */}
      <div
        className="animate-lantern-glow pointer-events-none absolute z-[2]"
        style={{
          top: "-6%",
          right: "2%",
          width: "28%",
          height: "55%",
          background:
            "radial-gradient(ellipse 55% 60% at 60% 28%, rgba(255,185,55,0.38) 0%, rgba(255,140,20,0.18) 38%, transparent 72%)",
          filter: "blur(18px)",
          mixBlendMode: "screen",
        }}
      />
      {/* Secondary tighter hotspot right on the lantern bulb */}
      <div
        className="animate-lantern-glow pointer-events-none absolute z-[2]"
        style={{
          top: "2%",
          right: "7%",
          width: "14%",
          height: "28%",
          background:
            "radial-gradient(ellipse 50% 55% at 55% 30%, rgba(255,220,120,0.55) 0%, rgba(255,165,30,0.22) 50%, transparent 80%)",
          filter: "blur(10px)",
          mixBlendMode: "screen",
          animationDelay: "0.6s",
        }}
      />

      {/* Subtle Cinematic Ambient Lighting Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

      {/* Central Interactive Content Area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4">
        {/* Luxury Brand Header (positioned gracefully in the upper-center royal archway) */}
        <div className="animate-butter-glide-down flex flex-col items-center text-center mb-4 sm:mb-6 select-none pointer-events-auto">
          {/* Royal Lotus Emblem Motif */}
          <div className="mb-2 sm:mb-3 drop-shadow-[0_0_20px_rgba(229,184,66,0.55)]">
            <svg
              viewBox="0 0 64 42"
              className="w-12 h-8 sm:w-16 sm:h-10 text-[#fbe28d] fill-current opacity-95 transition-transform duration-500 hover:scale-110"
              aria-hidden="true"
            >
              <path d="M32 2 C32 2 24 16 24 26 C24 33 28 36 32 36 C36 33 40 26 40 16 C40 2 32 2 32 2 Z" />
              <path d="M30 10 C30 10 18 19 16 28 C15 32 18 35 22 35 C26 35 29 30 30 24 Z" opacity="0.9" />
              <path d="M34 10 C34 10 46 19 48 28 C49 32 46 35 42 35 C38 35 35 30 34 24 Z" opacity="0.9" />
              <path d="M26 18 C26 18 10 24 7 32 C5 36 8 38 12 37 C18 36 23 29 25 24 Z" opacity="0.75" />
              <path d="M38 18 C38 18 54 24 57 32 C59 36 56 38 52 37 C46 36 41 29 39 24 Z" opacity="0.75" />
              <path d="M18 38 C25 41 39 41 46 38 C42 41 36 42 32 42 C28 42 22 41 18 38 Z" opacity="0.85" />
            </svg>
          </div>

          {/* ROKEA Luxury Brand Wordmark */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-b from-[#fff7e6] via-[#f0c34e] to-[#c8921a] drop-shadow-[0_4px_24px_rgba(240,195,78,0.55)]">
            ROKEA
          </h1>

          {/* Luxury Tagline */}
          <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs md:text-sm font-serif font-medium tracking-[0.28em] uppercase text-[#fbe28d]/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {t("tagline")}
          </p>

          {/* Ornamental Zari Divider */}
          <div className="flex items-center gap-3 mt-2.5 w-48 sm:w-64 opacity-85">
            <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#f0c34e] to-transparent" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#f0c34e] shadow-[0_0_8px_#f0c34e]" />
            <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#f0c34e] to-transparent" />
          </div>

          {/* Landing Page Experience Showcase Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-3.5 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-[#f0c34e]/30 text-[10px] sm:text-[11px] font-medium text-[#fbe28d] shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              <Shirt className="w-3 h-3 text-[#f0c34e]" />
              Pure Silk Sarees
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-[#f0c34e]/30 text-[10px] sm:text-[11px] font-medium text-[#fbe28d] shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              <Sparkles className="w-3 h-3 text-[#f0c34e]" />
              AI Virtual Try-On
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-[#f0c34e]/30 text-[10px] sm:text-[11px] font-medium text-[#fbe28d] shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              <Gem className="w-3 h-3 text-[#f0c34e]" />
              Royal Temple Jewels
            </span>
          </div>
        </div>

        {/* Vertical Spacing Spacer */}
        <div className="h-1 sm:h-3" />

        {/* Interactive Glowing Specular Start Icon Button */}
        <div className="animate-butter-glide-down pointer-events-auto flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <SpecularButton
              onClick={handleStart}
              aria-label={t("welcome.startButton")}
              radius={9999}
              size="icon"
              lineColor="#fff9e6"
              baseColor="#996f16"
              tint="#26040e"
              tintOpacity={0.42}
              blur={14}
              textColor="#faf5ed"
              intensity={1.35}
              idleIntensity={0.7}
              shineSize={12}
              shineFade={32}
              thickness={2.2}
              glow={1.6}
              speed={0.45}
              autoAnimate={true}
              followMouse={true}
              proximity={320}
              className={`group relative cursor-pointer w-28 h-28 sm:w-32 sm:h-32 rounded-full shadow-[0_0_40px_rgba(240,195,78,0.4),0_15px_35px_rgba(0,0,0,0.7)] hover:shadow-[0_0_65px_rgba(240,195,78,0.75),0_20px_45px_rgba(0,0,0,0.85)] transition-all duration-300 ${
                isPressed ? "scale-90 brightness-150" : ""
              }`}
            >
              <div className="relative flex flex-col items-center justify-center gap-1.5 select-none pointer-events-none">
                {/* Soft ambient gold aura behind the play badge */}
                <div className="absolute w-16 h-16 rounded-full bg-[#f0c34e]/20 blur-md pointer-events-none group-hover:bg-[#f0c34e]/40 transition-all duration-300" />

                {/* Translucent Frosted Glass Play Badge */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-gradient-to-b from-[#fff2cc]/25 via-[#f0c34e]/15 to-[#b8861e]/10 border border-[#fff2cc]/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_0_20px_rgba(240,195,78,0.3)] backdrop-blur-sm group-hover:scale-105 group-hover:border-[#fff2cc]/80 group-hover:shadow-[0_0_25px_rgba(240,195,78,0.55)] transition-all duration-300">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 text-[#fff8e7] fill-[#fbe28d] translate-x-0.5 filter drop-shadow-[0_2px_8px_rgba(240,195,78,0.6)] group-hover:fill-[#ffffff] transition-all duration-300" />
                </div>

                {/* START Typography */}
                <span className="relative text-[10px] sm:text-[11px] font-serif font-black tracking-[0.28em] text-[#faf5ed] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] group-hover:text-[#fbe28d] transition-colors duration-300">
                  START
                </span>
              </div>
            </SpecularButton>
          </div>

          {/* Invitation Hint Subtext */}
          <p className="mt-3 text-[11px] sm:text-xs text-[#faf5ed]/75 tracking-wider font-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-pulse">
            Touch to step inside the dressing room
          </p>
        </div>
      </div>
    </div>
  );
}
