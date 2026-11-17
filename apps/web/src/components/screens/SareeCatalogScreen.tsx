"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { Product, SareeCategory, Jewel, JewelCategory } from "@/features/tryon/types";
import { SAREE_CATALOG, JEWEL_CATALOG } from "@/features/tryon/catalogData";
import {
  Search,
  Sparkles,
  Check,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Gem,
  ChevronDown,
} from "lucide-react";
import SplitText from "@/components/SplitText";

// ─── Shared 3D Showroom Carousel ────────────────────────────────────────────

interface CarouselItem {
  id: string;
  name: string;
  name_ta: string;
  image_url: string;
  badge: string;
  price: number;
  sub: string;    // e.g. SKU or material
  detail: string; // e.g. fabric or origin
}

interface ShowroomCarouselProps {
  items: CarouselItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  language: string;
  accentLabel: string; // e.g. "ROKEA 3D SILK EXHIBIT"
}

function ShowroomCarousel({
  items,
  selectedId,
  onSelect,
  language,
  accentLabel,
}: ShowroomCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isPointerInside, setIsPointerInside] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Sync activeIndex when selectedId or items change
  useEffect(() => {
    if (items.length === 0) return;
    const idx = items.findIndex((it) => it.id === selectedId);
    setActiveIndex(idx !== -1 ? idx : 0);
  }, [selectedId, items]);

  const handlePrev = useCallback(() => {
    if (!items.length) return;
    setActiveIndex((prev) => {
      const next = (prev - 1 + items.length) % items.length;
      onSelect(items[next].id);
      return next;
    });
  }, [items, onSelect]);

  const handleNext = useCallback(() => {
    if (!items.length) return;
    setActiveIndex((prev) => {
      const next = (prev + 1) % items.length;
      onSelect(items[next].id);
      return next;
    });
  }, [items, onSelect]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); handlePrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); handleNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlePrev, handleNext]);

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setHoveredId(id);
    setCardTilt({ x: -Math.max(-1, Math.min(1, dy)) * 8, y: Math.max(-1, Math.min(1, dx)) * 8 });
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    setHoveredId(null);
    setCardTilt({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setIsPointerInside(true);
      }}
      onMouseLeave={() => { setIsPointerInside(false); setCursorPos(null); setHoveredId(null); setCardTilt({ x: 0, y: 0 }); }}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) dx > 0 ? handlePrev() : handleNext();
        touchStartX.current = null;
      }}
      className="relative w-full min-h-[440px] md:min-h-[500px] flex items-center justify-center overflow-hidden rounded-3xl cursor-crosshair border-2 border-[#e5b842]/50 shadow-[0_0_35px_rgba(229,184,66,0.25)]"
      style={{
        background: "radial-gradient(ellipse at 50% 45%, #eceae5 0%, #dedad3 45%, #c8c3ba 85%, #b5af9f 100%)",
        boxShadow: "0 0 35px rgba(229,184,66,0.25), inset 0 0 80px rgba(0,0,0,0.25), 0 20px 40px rgba(0,0,0,0.4)",
      }}
    >
      {/* Floor vignette */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#9f988b]/40 via-transparent to-transparent pointer-events-none" />

      {/* Accent label */}
      <div className="absolute top-6 left-8 flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#5c5446]/80 uppercase pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#b8861e] animate-ping" />
        <span>{accentLabel} • {items.length} DESIGNS</span>
      </div>

      {/* Floor shadow */}
      <div className="absolute bottom-10 inset-x-24 h-10 bg-black/15 blur-2xl rounded-full pointer-events-none" />

      {/* Nav: Prev */}
      <button
        onClick={handlePrev}
        className="absolute left-4 md:left-8 z-40 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1b040d]/75 backdrop-blur-md border border-[#e5b842]/60 text-[#e5b842] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer group"
        aria-label="Previous"
      >
        <ChevronLeft className="w-7 h-7 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Nav: Next */}
      <button
        onClick={handleNext}
        className="absolute right-4 md:right-8 z-40 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1b040d]/75 backdrop-blur-md border border-[#e5b842]/60 text-[#e5b842] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer group"
        aria-label="Next"
      >
        <ChevronRight className="w-7 h-7 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* 3D Stage */}
      <div
        className="relative w-full h-[400px] md:h-[460px] flex items-center justify-center pointer-events-auto"
        style={{ perspective: "1400px", transformStyle: "preserve-3d" }}
      >
        {items.map((item, index) => {
          const count = items.length;
          let diff = index - activeIndex;
          if (diff > count / 2) diff -= count;
          if (diff < -count / 2) diff += count;
          if (Math.abs(diff) > 3) return null;

          const isCenter = diff === 0;
          const isHovered = hoveredId === item.id;
          const isSelected = item.id === selectedId;
          const xPos = diff * 260;
          const zPos = -Math.abs(diff) * 130 + (isCenter ? 25 : 0);
          const yRotate = -diff * 28;
          const baseScale = isCenter ? 1.05 : Math.max(0.68, 1 - Math.abs(diff) * 0.13);
          const opacity = Math.max(0.35, 1 - Math.abs(diff) * 0.22);
          const zIndex = 50 - Math.abs(diff) * 10 + (isHovered ? 5 : 0);
          const tiltX = isHovered ? cardTilt.x : 0;
          const tiltY = isHovered ? yRotate + cardTilt.y : yRotate;
          const scale = isHovered ? baseScale * 1.03 : baseScale;

          return (
            <div
              key={item.id}
              onClick={() => { setActiveIndex(index); onSelect(item.id); }}
              onMouseMove={(e) => handleCardMouseMove(e, item.id)}
              onMouseLeave={handleCardMouseLeave}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] md:w-[280px] h-[350px] md:h-[400px] cursor-pointer"
              style={{
                zIndex,
                transform: `translate3d(${xPos}px,0px,${zPos}px) rotateY(${tiltY}deg) rotateX(${tiltX}deg) scale(${scale})`,
                opacity,
                transition: isHovered
                  ? "transform 0.1s ease-out, box-shadow 0.25s ease"
                  : "transform 0.65s cubic-bezier(0.22,1,0.36,1), opacity 0.65s ease, filter 0.65s ease",
                willChange: "transform, opacity",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Ground shadow */}
              <div
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 50%, transparent 75%)",
                  transform: `scale(${isCenter ? 1.2 : 0.85})`,
                  filter: "blur(6px)",
                }}
              />

              {/* Card */}
              <div
                className={`relative w-full h-full rounded-[28px] overflow-hidden transition-all duration-300 ${
                  isHovered
                    ? "ring-2 ring-white/90 shadow-[0_0_35px_rgba(255,255,255,0.95),0_0_70px_rgba(229,184,66,0.55),0_30px_60px_rgba(0,0,0,0.35)]"
                    : isSelected
                    ? "ring-2 ring-[#e5b842] shadow-[0_0_25px_rgba(229,184,66,0.6),0_25px_50px_rgba(0,0,0,0.25)]"
                    : "ring-1 ring-black/10 shadow-[0_20px_45px_rgba(0,0,0,0.22)]"
                }`}
                style={{ backgroundColor: "#1b040d" }}
              >
                <div className="relative w-full h-full bg-[#1b040d] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/35 pointer-events-none" />

                  {/* Top badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] uppercase font-bold text-[#faf5ed] tracking-wider">
                      {item.badge}
                    </span>
                    {isSelected && (
                      <div className="w-7 h-7 rounded-full gold-gradient-bg text-[#1a040b] flex items-center justify-center font-bold shadow-lg">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-3 inset-x-3 pointer-events-none z-10">
                    <span className="text-[10px] uppercase tracking-wider text-[#e5b842] font-semibold block">
                      {item.sub}
                    </span>
                    <h4 className="text-sm font-serif font-bold text-[#faf5ed] line-clamp-1 drop-shadow-md">
                      {language === "ta" ? item.name_ta : item.name}
                    </h4>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/15">
                      <span className="text-xs font-serif font-bold text-[#faf5ed]">
                        ₹ {item.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-[#e5b842] font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{item.detail}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Crosshair cursor */}
      {isPointerInside && cursorPos && (
        <div
          className="pointer-events-none absolute z-50"
          style={{ left: cursorPos.x, top: cursorPos.y, transform: "translate(-50%,-50%)" }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#1b040d] border border-[#e5b842] shadow-[0_0_8px_rgba(229,184,66,0.8)]" />
          <div className="absolute top-1/2 left-[-16px] w-[12px] h-[1px] bg-[#1b040d]/80 -translate-y-1/2" />
          <div className="absolute top-1/2 right-[-16px] w-[12px] h-[1px] bg-[#1b040d]/80 -translate-y-1/2" />
          <div className="absolute left-1/2 top-[-16px] h-[12px] w-[1px] bg-[#1b040d]/80 -translate-x-1/2" />
          <div className="absolute left-1/2 bottom-[-16px] h-[12px] w-[1px] bg-[#1b040d]/80 -translate-x-1/2" />
          <div className="absolute inset-[-10px] rounded-full border border-[#1b040d]/30" />
        </div>
      )}
    </div>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

interface SareeCatalogScreenProps {
  customerImageUrl: string;
  selectedProductId: string | null;
  selectedJewelId: string | null;
  onSelectProduct: (productId: string) => void;
  onSelectJewel: (jewelId: string) => void;
  onProceedToTryOn: () => void;
  onBackToHome?: () => void;
}

export function SareeCatalogScreen({
  customerImageUrl,
  selectedProductId,
  selectedJewelId,
  onSelectProduct,
  onSelectJewel,
  onProceedToTryOn,
  onBackToHome,
}: SareeCatalogScreenProps) {
  const { t, language } = useTranslation();

  // ── Saree filters ──
  const [sareeCategory, setSareeCategory] = useState<string>("all");
  const [sareeSearch, setSareeSearch] = useState<string>("");

  // ── Jewel filters ──
  const [jewelCategory, setJewelCategory] = useState<string>("all");
  const [jewelSearch, setJewelSearch] = useState<string>("");

  // Scroll refs
  const jewelsRef = useRef<HTMLDivElement | null>(null);

  const sareeCategories: { id: SareeCategory; label: string }[] = useMemo(() => [
    { id: "all", label: t("catalog.categories.all") },
    { id: "pattu", label: t("catalog.categories.pattu") },
    { id: "silk", label: t("catalog.categories.silk") },
    { id: "soft_silk", label: t("catalog.categories.soft_silk") },
    { id: "premium_soft_silk", label: t("catalog.categories.premium_soft_silk") },
    { id: "kasavu", label: t("catalog.categories.kasavu") },
    { id: "dubion", label: t("catalog.categories.dubion") },
    { id: "cotton", label: t("catalog.categories.cotton") },
    { id: "butter_silk", label: t("catalog.categories.butter_silk") },
    { id: "crepe", label: t("catalog.categories.crepe") },
  ], [t]);

  const jewelCategories: { id: JewelCategory; label: string }[] = [
    { id: "all", label: "All Jewels" },
    { id: "necklace", label: "Necklace" },
    { id: "earrings", label: "Earrings" },
    { id: "bangles", label: "Bangles" },
    { id: "maang_tikka", label: "Maang Tikka" },
    { id: "waist_belt", label: "Waist Belt" },
    { id: "anklet", label: "Anklet" },
  ];

  // ── Filtered lists ──
  const filteredSarees = useMemo(() => {
    return SAREE_CATALOG.filter((p) => {
      const matchCat = sareeCategory === "all" || p.category === sareeCategory;
      const term = sareeSearch.trim().toLowerCase();
      const matchSearch = !term ||
        p.name.toLowerCase().includes(term) ||
        p.name_ta.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.fabric.toLowerCase().includes(term) ||
        p.color_tone.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [sareeCategory, sareeSearch]);

  const filteredJewels = useMemo(() => {
    return JEWEL_CATALOG.filter((j) => {
      const matchCat = jewelCategory === "all" || j.category === jewelCategory;
      const term = jewelSearch.trim().toLowerCase();
      const matchSearch = !term ||
        j.name.toLowerCase().includes(term) ||
        j.name_ta.toLowerCase().includes(term) ||
        j.material.toLowerCase().includes(term) ||
        j.color_tone.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [jewelCategory, jewelSearch]);

  // ── Map to CarouselItem ──
  const sareeItems: CarouselItem[] = useMemo(() =>
    filteredSarees.map((p) => ({
      id: p.id,
      name: p.name,
      name_ta: p.name_ta,
      image_url: p.image_url,
      badge: t(`catalog.categories.${p.category}`),
      price: p.price,
      sub: p.sku,
      detail: "Pure Zari Silk",
    })),
  [filteredSarees, t]);

  const jewelItems: CarouselItem[] = useMemo(() =>
    filteredJewels.map((j) => ({
      id: j.id,
      name: j.name,
      name_ta: j.name_ta,
      image_url: j.image_url,
      badge: j.category.replace("_", " "),
      price: j.price,
      sub: j.sku,
      detail: j.material.split(" with ")[0],
    })),
  [filteredJewels]);

  // ── Current selected objects ──
  const currentSaree = useMemo(() =>
    filteredSarees.find((p) => p.id === selectedProductId) || filteredSarees[0] || SAREE_CATALOG[0],
  [filteredSarees, selectedProductId]);

  const currentJewel = useMemo(() =>
    filteredJewels.find((j) => j.id === selectedJewelId) || null,
  [filteredJewels, selectedJewelId]);

  const scrollToJewels = () => {
    jewelsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative z-10 min-h-[calc(100vh-68px)] flex flex-col p-4 md:p-6 select-none overflow-x-hidden gap-8">

      {/* ═══════════════════════════════════ SECTION 1: SAREE ═══════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto flex flex-col gap-4">

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                title="Back to Front Page"
                className="w-10 h-10 rounded-2xl bg-[#260712]/90 border border-[#e5b842]/40 text-[#e5b842] hover:bg-[#e5b842] hover:text-[#1a040b] transition-all flex items-center justify-center cursor-pointer shadow-lg shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#340c1a]/80 border border-[#e5b842]/40 text-[#e5b842] text-xs font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cinematic 3D Showroom</span>
              </div>
              <SplitText
                text={t("catalog.title")}
                tag="h2"
                className="text-2xl md:text-4xl font-serif font-bold text-[#faf5ed] tracking-tight"
                delay={35}
                duration={0.9}
                effect="rise"
                hoverEffect="lift"
                accentColor="#f0c34e"
                trigger="load"
              />
            </div>
          </div>

          {/* Silhouette pill */}
          <div className="flex items-center gap-3 bg-[#260712]/90 border border-[#e5b842]/40 rounded-2xl p-2 pr-4 shadow-xl shrink-0 backdrop-blur-md">
            <div className="relative w-11 h-14 rounded-xl overflow-hidden border border-[#e5b842] bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={customerImageUrl} alt="Your Silhouette" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-[#e5b842] tracking-wider flex items-center gap-1">
                <Check className="w-3 h-3 text-[#22c55e]" />
                READY TO DRAPE
              </span>
              <span className="text-xs text-[#faf5ed] font-medium">Your Silhouette</span>
            </div>
          </div>
        </div>

        {/* Saree search + category pills */}
        <div className="flex flex-col lg:flex-row items-center gap-3">
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#e5b842]/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={sareeSearch}
              onChange={(e) => setSareeSearch(e.target.value)}
              placeholder={t("catalog.searchPlaceholder")}
              className="w-full bg-[#260712]/80 border border-[#e5b842]/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#faf5ed] placeholder-[#d4c2b2]/50 focus:outline-none focus:border-[#e5b842] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-none">
            {sareeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSareeCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  sareeCategory === cat.id
                    ? "gold-gradient-bg text-[#1a040b] font-bold shadow-md shadow-[#e5b842]/20 scale-[1.02]"
                    : "bg-[#260712]/70 border border-[#e5b842]/25 text-[#faf5ed]/90 hover:border-[#e5b842]/70 hover:text-[#faf5ed]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Saree carousel */}
        <ShowroomCarousel
          items={sareeItems}
          selectedId={selectedProductId}
          onSelect={onSelectProduct}
          language={language}
          accentLabel="ROKEA 3D SILK EXHIBIT"
        />

        {/* Scroll to jewels CTA */}
        <div className="flex justify-end">
          <button
            onClick={scrollToJewels}
            className="group px-6 py-3 rounded-2xl border-2 border-[#e5b842]/70 bg-[#1b040d] text-[#e5b842] hover:bg-[#e5b842]/10 hover:border-[#e5b842] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_20px_rgba(229,184,66,0.2)]"
            title="Choose Your Jewels"
          >
            <Gem className="w-5 h-5 text-[#e5b842] group-hover:scale-110 transition-transform" />
            <SplitText
              text={t("catalog.selectJewelsBtn")}
              tag="span"
              className="font-serif font-bold text-sm tracking-wide text-[#e5b842]"
              delay={25}
              duration={0.7}
              effect="rise"
              hoverEffect="lift"
              accentColor="#f0c34e"
              trigger="load"
            />
            <ChevronDown className="w-4 h-4 animate-bounce text-[#e5b842]" />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════ SECTION 2: JEWELS ══════════════════════════════════ */}
      <section ref={jewelsRef} className="w-full max-w-7xl mx-auto flex flex-col gap-4 scroll-mt-6">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a0a30]/80 border border-[#c8a0f0]/40 text-[#c8a0f0] text-xs font-semibold uppercase tracking-wider mb-1">
              <Gem className="w-3.5 h-3.5" />
              <span>Royal Jewellery Collection</span>
            </div>
            <SplitText
              text={t("catalog.selectJewelsTitle")}
              tag="h2"
              className="text-2xl md:text-4xl font-serif font-bold text-[#faf5ed] tracking-tight"
              delay={35}
              duration={0.9}
              effect="rise"
              hoverEffect="lift"
              accentColor="#c8a0f0"
              trigger="view"
              scroller="#catalog-scroll-container"
            />
          </div>
          {currentJewel && (
            <div className="text-xs text-[#c8a0f0] border border-[#c8a0f0]/30 bg-[#1a0a30]/60 px-3 py-1.5 rounded-full font-medium">
              ✓ Jewel Selected
            </div>
          )}
        </div>

        {/* Jewel search + category pills */}
        <div className="flex flex-col lg:flex-row items-center gap-3">
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#c8a0f0]/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={jewelSearch}
              onChange={(e) => setJewelSearch(e.target.value)}
              placeholder="Search jewels..."
              className="w-full bg-[#1a0a30]/80 border border-[#c8a0f0]/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#faf5ed] placeholder-[#d4c2b2]/50 focus:outline-none focus:border-[#c8a0f0] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-none">
            {jewelCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setJewelCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  jewelCategory === cat.id
                    ? "bg-gradient-to-r from-[#c8a0f0] to-[#9b59d8] text-white font-bold shadow-md scale-[1.02]"
                    : "bg-[#1a0a30]/70 border border-[#c8a0f0]/25 text-[#faf5ed]/90 hover:border-[#c8a0f0]/70"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Jewel carousel – same proven component as sarees, purple accent */}
        <ShowroomCarousel
          items={jewelItems}
          selectedId={selectedJewelId}
          onSelect={onSelectJewel}
          language={language}
          accentLabel="ROKEA ROYAL JEWELLERY"
        />

        {/* Jewel info drawer + final CTA */}
        <div className="w-full bg-[#0d0618]/95 backdrop-blur-md border-2 border-[#c8a0f0]/50 rounded-3xl p-4 md:p-6 shadow-[0_0_35px_rgba(200,160,240,0.2)] flex flex-col lg:flex-row items-center justify-between gap-6">
          {currentJewel ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              <div className="relative w-16 h-20 rounded-2xl overflow-hidden border-2 border-[#c8a0f0] bg-black shrink-0 shadow-[0_0_20px_rgba(200,160,240,0.4)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentJewel.image_url} alt={currentJewel.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-[#c8a0f0] font-bold">{currentJewel.sku}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a0a30] border border-[#c8a0f0]/30 text-[#c8a0f0] font-medium capitalize">
                    {currentJewel.category.replace("_", " ")}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-serif font-bold text-[#faf5ed]">
                  {language === "ta" ? currentJewel.name_ta : currentJewel.name}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#d4c2b2]">
                  <span className="text-base font-serif font-bold text-[#faf5ed]">
                    ₹ {currentJewel.price.toLocaleString("en-IN")}
                  </span>
                  <span>•</span>
                  <span className="max-w-md truncate">{language === "ta" ? currentJewel.material_ta : currentJewel.material}</span>
                  <span>•</span>
                  <span className="text-[#c8a0f0]">{language === "ta" ? currentJewel.origin_ta : currentJewel.origin}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-[#d4c2b2]/60 italic text-sm">
              <Gem className="w-5 h-5 text-[#c8a0f0]/40" />
              Select a jewel set above to complete your look
            </div>
          )}

          {/* Final Try-On CTA */}
          <button
            onClick={onProceedToTryOn}
            className="w-full sm:w-auto px-10 py-5 rounded-2xl gold-gradient-bg font-serif font-bold text-lg text-[#1a040b] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer touch-manipulation min-h-[64px]"
          >
            <Sparkles className="w-5 h-5 text-[#1a040b]" />
            <span>{t("catalog.tryOnBtn")}</span>
            <ArrowRight className="w-5 h-5 text-[#1a040b]" />
          </button>
        </div>
      </section>
    </div>
  );
}
