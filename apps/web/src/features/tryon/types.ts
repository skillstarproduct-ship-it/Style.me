export type SareeCategory =
  | "all"
  | "silk"
  | "soft_silk"
  | "premium_soft_silk"
  | "pattu"
  | "kasavu"
  | "dubion"
  | "cotton"
  | "butter_silk"
  | "crepe"
  | "kanchipuram"
  | "banarasi"
  | "chanderi"
  | "festive"
  | string;

export interface Product {
  id: string;
  sku: string;
  name: string;
  name_ta: string;
  category: SareeCategory;
  price: number;
  stock_status: "in_stock" | "made_to_order" | "out_of_stock";
  image_url: string;
  tryon_eligible: boolean;
  fabric: string;
  fabric_ta: string;
  origin: string;
  origin_ta: string;
  pallu_details: string;
  pallu_details_ta: string;
  color_tone: string;
}

export type JewelCategory =
  | "all"
  | "necklace"
  | "earrings"
  | "bangles"
  | "maang_tikka"
  | "waist_belt"
  | "anklet"
  | string;

export interface Jewel {
  id: string;
  sku: string;
  name: string;
  name_ta: string;
  category: JewelCategory;
  price: number;
  stock_status: "in_stock" | "made_to_order" | "out_of_stock";
  image_url: string;
  material: string;
  material_ta: string;
  origin: string;
  origin_ta: string;
  color_tone: string;
}

export type TryOnJobStatus =
  | "validating"
  | "queued"
  | "processing"
  | "quality_review"
  | "completed"
  | "failed";

export interface TryOnJobState {
  jobId: string;
  status: TryOnJobStatus;
  progressPercent: number;
  currentMessageKey: string;
  estimatedCost: number;
  latencyMs: number;
  resultImageUrl?: string;
  errorCode?: string;
}
