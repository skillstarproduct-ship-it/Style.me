"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type KioskStep =
  | "welcome"
  | "permission"
  | "positioning"
  | "confirm"
  | "catalog"
  | "generating"
  | "result";

export interface CapturedImageMeta {
  width: number;
  height: number;
  sizeBytes: number;
  timestamp: number;
}

export interface TryOnResultData {
  jobId: string;
  resultImageUrl: string;
  provider: "mock" | "fashn" | "kling";
  qualityStatus: "passed" | "reviewed";
  createdAt: number;
}

export interface FeedbackData {
  designFidelity: number; // 1-5
  draping: number; // 1-5
  identityPreservation: number; // 1-5
  issueCategory: string;
  comment: string;
}

const INACTIVITY_TIMEOUT_SECONDS = 90;
const INACTIVITY_WARNING_SECONDS = 15;

export interface KioskSessionState {
  sessionId: string;
  currentStep: KioskStep;
  consentTimestamp: number | null;
  capturedImageData: string | null;
  capturedMeta: CapturedImageMeta | null;
  selectedProductId: string | null;
  selectedJewelId: string | null;
  activeJobId: string | null;
  tryonResult: TryOnResultData | null;
  feedback: FeedbackData | null;
}

export function generateSessionId(): string {
  if (typeof window === "undefined") {
    return "guest_ssr_kiosk";
  }
  return "guest_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 8);
}

export function useKioskSession(onSessionReset?: () => void) {
  const [session, setSession] = useState<KioskSessionState>(() => ({
    sessionId: "guest_kiosk_initial",
    currentStep: "welcome",
    consentTimestamp: null,
    capturedImageData: null,
    capturedMeta: null,
    selectedProductId: null,
    selectedJewelId: null,
    activeJobId: null,
    tryonResult: null,
    feedback: null,
  }));

  // Generate unique client-side session ID after mount
  useEffect(() => {
    setSession((prev) => {
      if (prev.sessionId === "guest_kiosk_initial") {
        return { ...prev, sessionId: generateSessionId() };
      }
      return prev;
    });
  }, []);

  const [inactivitySecondsLeft, setInactivitySecondsLeft] = useState<number>(INACTIVITY_TIMEOUT_SECONDS);
  const [showInactivityWarning, setShowInactivityWarning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Full reset adhering strictly to customer privacy & Flow C
  const resetSession = useCallback(() => {
    // Revoke any in-memory Object URLs if present
    if (session.capturedImageData?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(session.capturedImageData);
      } catch (e) {
        // ignore
      }
    }

    setSession({
      sessionId: generateSessionId(),
      currentStep: "welcome",
      consentTimestamp: null,
      capturedImageData: null,
      capturedMeta: null,
      selectedProductId: null,
      selectedJewelId: null,
      activeJobId: null,
      tryonResult: null,
      feedback: null,
    });

    setShowInactivityWarning(false);
    setInactivitySecondsLeft(INACTIVITY_TIMEOUT_SECONDS);

    if (onSessionReset) {
      onSessionReset();
    }
  }, [session.capturedImageData, onSessionReset]);

  // Activity ping to reset the inactivity timer
  const pingActivity = useCallback(() => {
    setInactivitySecondsLeft(INACTIVITY_TIMEOUT_SECONDS);
    setShowInactivityWarning(false);
  }, []);

  // Monitor inactivity timer while not on welcome screen
  useEffect(() => {
    if (session.currentStep === "welcome") {
      setShowInactivityWarning(false);
      return;
    }

    const interval = setInterval(() => {
      setInactivitySecondsLeft((prev) => {
        if (prev <= 1) {
          // Timeout reached: trigger hard reset
          resetSession();
          return INACTIVITY_TIMEOUT_SECONDS;
        }

        const next = prev - 1;
        if (next <= INACTIVITY_WARNING_SECONDS) {
          setShowInactivityWarning(true);
        } else {
          setShowInactivityWarning(false);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session.currentStep, resetSession]);

  // Set current kiosk step
  const goToStep = useCallback((step: KioskStep) => {
    setSession((prev) => ({ ...prev, currentStep: step }));
    setInactivitySecondsLeft(INACTIVITY_TIMEOUT_SECONDS);
    setShowInactivityWarning(false);
  }, []);

  // Save captured still
  const setCapturedImage = useCallback((dataUrl: string, meta: CapturedImageMeta) => {
    setSession((prev) => ({
      ...prev,
      capturedImageData: dataUrl,
      capturedMeta: meta,
      currentStep: "confirm",
    }));
    setInactivitySecondsLeft(INACTIVITY_TIMEOUT_SECONDS);
  }, []);

  // Record explicit consent
  const recordConsentAndProceed = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      consentTimestamp: Date.now(),
      currentStep: "catalog",
    }));
    setInactivitySecondsLeft(INACTIVITY_TIMEOUT_SECONDS);
  }, []);

  // Select saree product
  const selectProduct = useCallback((productId: string) => {
    setSession((prev) => ({
      ...prev,
      selectedProductId: productId,
    }));
    setInactivitySecondsLeft(INACTIVITY_TIMEOUT_SECONDS);
  }, []);

  // Select jewel
  const selectJewel = useCallback((jewelId: string) => {
    setSession((prev) => ({
      ...prev,
      selectedJewelId: jewelId,
    }));
    setInactivitySecondsLeft(INACTIVITY_TIMEOUT_SECONDS);
  }, []);

  // Start virtual try-on generation
  const startTryOnJob = useCallback((jobId: string) => {
    setSession((prev) => ({
      ...prev,
      activeJobId: jobId,
      currentStep: "generating",
    }));
    setInactivitySecondsLeft(INACTIVITY_TIMEOUT_SECONDS);
  }, []);

  // Set try-on result
  const setTryOnResult = useCallback((result: TryOnResultData) => {
    setSession((prev) => ({
      ...prev,
      tryonResult: result,
      currentStep: "result",
    }));
    setInactivitySecondsLeft(INACTIVITY_TIMEOUT_SECONDS);
  }, []);

  // Save feedback
  const submitFeedback = useCallback((feedback: FeedbackData) => {
    setSession((prev) => ({
      ...prev,
      feedback,
    }));
  }, []);

  return {
    session,
    goToStep,
    setCapturedImage,
    recordConsentAndProceed,
    selectProduct,
    selectJewel,
    startTryOnJob,
    setTryOnResult,
    submitFeedback,
    resetSession,
    pingActivity,
    inactivitySecondsLeft,
    showInactivityWarning,
  };
}
