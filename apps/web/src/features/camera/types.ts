export type CameraStatus =
  | "idle"
  | "requesting"
  | "active"
  | "denied"
  | "not_found"
  | "error";

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface FramingStatus {
  hasPerson: boolean;
  multiplePeople: boolean;
  headInFrame: boolean;
  feetInFrame: boolean;
  isCentered: boolean;
  distanceStatus: "optimal" | "too_close" | "too_far" | "unknown";
  lightingStatus: "good" | "low" | "backlit";
  isSteady: boolean;
  isFramingPerfect: boolean;
  guidanceKey: string;
  confidence: number;
}
