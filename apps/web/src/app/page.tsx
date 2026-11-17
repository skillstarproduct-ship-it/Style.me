"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { LanguageProvider, useTranslation } from "@/i18n/LanguageContext";
import { useKioskSession, KioskStep } from "@/features/session/sessionStore";
import { useCamera } from "@/features/camera/useCamera";
import { useFramingCheck } from "@/features/camera/useFramingCheck";
import { captureStillFromVideo } from "@/features/camera/capture";
import { soundManager } from "@/features/camera/audioEffects";
import { SAREE_CATALOG } from "@/features/tryon/catalogData";
import { mockVTONProvider } from "@/features/tryon/mockProvider";
import { TryOnJobState } from "@/features/tryon/types";

import { KioskHeader } from "@/components/KioskHeader";
import { InactivityModal } from "@/components/InactivityModal";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { CameraPermissionScreen } from "@/components/screens/CameraPermissionScreen";
import { LivePositioningScreen } from "@/components/screens/LivePositioningScreen";
import { CaptureConfirmScreen } from "@/components/screens/CaptureConfirmScreen";
import { SareeCatalogScreen } from "@/components/screens/SareeCatalogScreen";
import { GenerationScreen } from "@/components/screens/GenerationScreen";
import { ResultScreen } from "@/components/screens/ResultScreen";
import { FeedbackModal } from "@/components/FeedbackModal";
import { QrModal } from "@/components/QrModal";

function KioskApp() {
  const [isMuted, setIsMuted] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Active AI generation state
  const [activeJobState, setActiveJobState] = useState<TryOnJobState>({
    jobId: "",
    status: "validating",
    progressPercent: 0,
    currentMessageKey: "generating.steps.validating",
    estimatedCost: 0,
    latencyMs: 0,
  });

  // Camera hook
  const {
    status: cameraStatus,
    errorMessage: cameraError,
    devices,
    selectedDeviceId,
    videoRef,
    startCamera,
    stopCamera,
    switchDevice,
    refreshDevices,
  } = useCamera();

  // Session hook
  const handleSessionResetCleanup = useCallback(() => {
    stopCamera();
    mockVTONProvider.cancel();
    setShowFeedbackModal(false);
    setShowQrModal(false);
    setIsCatalogOpen(false);
  }, [stopCamera]);

  const {
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
  } = useKioskSession(handleSessionResetCleanup);

  // Still capture handler
  const handleCapture = useCallback(async () => {
    if (videoRef.current && cameraStatus === "active") {
      try {
        const result = await captureStillFromVideo(videoRef.current);
        stopCamera();
        setCapturedImage(result.dataUrl, result.meta);
      } catch (err) {
        console.error("Capture failed:", err);
      }
    }
  }, [videoRef, cameraStatus, stopCamera, setCapturedImage]);

  // Fallback sample customer silhouette (for testing or device without camera)
  const handleUseSampleSilhouette = useCallback(() => {
    stopCamera();
    setCapturedImage("/images/customer-sample.jpg", {
      width: 1080,
      height: 1920,
      sizeBytes: 746249,
      timestamp: Date.now(),
    });
  }, [stopCamera, setCapturedImage]);

  // Real-time body-framing checks
  const isPositioningActive = session.currentStep === "positioning";
  const {
    framingStatus,
    isModelLoading,
    modelError,
    countdownRemaining,
    stabilityProgress,
  } = useFramingCheck({
    videoRef,
    isCameraActive: isPositioningActive && cameraStatus === "active",
    onAutoCapture: handleCapture,
    autoCaptureDuration: 2.0,
  });

  // Keep isCatalogOpen in sync with session step changes
  useEffect(() => {
    if (session.currentStep === "catalog") {
      setIsCatalogOpen(true);
    } else if (session.currentStep === "welcome") {
      setIsCatalogOpen(false);
    }
  }, [session.currentStep]);

  // Start from welcome (Landing Page) -> Pop catalog sheet down-to-up
  const handleStartKiosk = useCallback(() => {
    setIsCatalogOpen(true);
    goToStep("catalog");
  }, [goToStep]);

  // Slide catalog sheet back down to landing page
  const handleCloseCatalog = useCallback(() => {
    setIsCatalogOpen(false);
    setTimeout(() => {
      goToStep("welcome");
    }, 450);
  }, [goToStep]);

  // Request camera activation
  const handleRequestCamera = useCallback(async () => {
    await startCamera();
    goToStep("positioning");
  }, [startCamera, goToStep]);

  // Retake photo
  const handleRetake = useCallback(async () => {
    goToStep("positioning");
    await startCamera();
  }, [goToStep, startCamera]);

  // Run AI virtual try-on generation
  const runTryOnGeneration = useCallback(
    async (productId: string, imageSrc?: string) => {
      const jobId = "job_" + Math.random().toString(36).substring(2, 9);
      startTryOnJob(jobId);

      const targetProductId = productId || session.selectedProductId || SAREE_CATALOG[0].id;
      const customerImg = imageSrc || session.capturedImageData || "/images/customer-sample.jpg";

      try {
        const finalResultUrl = await mockVTONProvider.runMockTryOn({
          jobId,
          customerImage: customerImg,
          productId: targetProductId,
          onProgress: (state) => {
            setActiveJobState(state);
          },
        });

        setTryOnResult({
          jobId,
          resultImageUrl: finalResultUrl,
          provider: "mock",
          qualityStatus: "passed",
          createdAt: Date.now(),
        });
      } catch (e) {
        console.error("VTON job failed:", e);
      }
    },
    [session.selectedProductId, session.capturedImageData, startTryOnJob, setTryOnResult]
  );

  // Proceed from catalog to AI virtual try-on generation
  const handleProceedToTryOn = useCallback(() => {
    const targetProductId = session.selectedProductId || SAREE_CATALOG[0].id;
    if (!session.selectedProductId) {
      selectProduct(targetProductId);
    }

    // If customer silhouette not yet captured, guide them to camera setup
    if (!session.capturedImageData) {
      setIsCatalogOpen(false);
      goToStep("permission");
      return;
    }

    // Silhouette already exists, generate drape immediately
    runTryOnGeneration(targetProductId);
  }, [session.selectedProductId, session.capturedImageData, selectProduct, goToStep, runTryOnGeneration]);

  // Proceed with confirmed capture & recorded consent to try-on generation
  const handleConfirmCapture = useCallback(() => {
    recordConsentAndProceed();
    const targetProductId = session.selectedProductId || SAREE_CATALOG[0].id;
    if (!session.selectedProductId) {
      selectProduct(targetProductId);
    }
    runTryOnGeneration(targetProductId);
  }, [recordConsentAndProceed, session.selectedProductId, selectProduct, runTryOnGeneration]);

  // Try another saree without recapturing customer photo
  const handleTryAnotherSaree = useCallback(() => {
    setIsCatalogOpen(true);
    goToStep("catalog");
  }, [goToStep]);

  // Centralized intelligent Back navigation across all screens
  const handleGoBack = useCallback(() => {
    switch (session.currentStep) {
      case "catalog":
        // Slide down catalog sheet to return to landing page
        handleCloseCatalog();
        break;
      case "permission":
        // Back to 3D Saree Catalog
        setIsCatalogOpen(true);
        goToStep("catalog");
        break;
      case "positioning":
        // Stop active camera and return to Saree Catalog
        stopCamera();
        setIsCatalogOpen(true);
        goToStep("catalog");
        break;
      case "confirm":
        // Back to camera to retake
        handleRetake();
        break;
      case "generating":
        // Cancel active generation job and return to Saree Catalog
        mockVTONProvider.cancel();
        setIsCatalogOpen(true);
        goToStep("catalog");
        break;
      case "result":
        // Return to Saree Catalog to browse
        setIsCatalogOpen(true);
        goToStep("catalog");
        break;
      default:
        goToStep("welcome");
        break;
    }
  }, [session.currentStep, goToStep, stopCamera, handleRetake, handleCloseCatalog]);

  // Direct step jump from breadcrumbs in header
  const handleSelectStep = useCallback(
    (targetStep: KioskStep) => {
      if (targetStep === session.currentStep) return;

      if (session.currentStep === "positioning" && targetStep !== "positioning") {
        stopCamera();
      }
      if (session.currentStep === "generating" && targetStep !== "generating") {
        mockVTONProvider.cancel();
      }

      if (targetStep === "catalog") {
        setIsCatalogOpen(true);
      }

      if (targetStep === "positioning") {
        handleRetake();
      } else {
        goToStep(targetStep);
      }
    },
    [session.currentStep, stopCamera, handleRetake, goToStep]
  );

  // Selected product object
  const currentProduct =
    SAREE_CATALOG.find((p) => p.id === session.selectedProductId) || SAREE_CATALOG[0];

  return (
    <div
      onClick={pingActivity}
      onTouchStart={pingActivity}
      className="relative w-full h-screen overflow-hidden text-[#faf5ed] bg-[#160309] select-none"
    >
      {/* ════════════════ LAYER 0: FRONT PAGE (PERSISTENT BASE) ════════════════ */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <WelcomeScreen onStart={handleStartKiosk} />
      </div>

      {/* ════════════════ LAYER 1: SECOND PAGE (SLIDES CLEANLY FROM BOTTOM TO TOP) ════════════════ */}
      <div
        className={`fixed inset-0 z-20 flex flex-col bg-[#160309] smooth-page-up ${
          isCatalogOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Seamless Integrated Header inside Second Page */}
        <div className="shrink-0 z-30">
          <KioskHeader
            currentStep="catalog"
            isCameraActive={cameraStatus === "active"}
            onResetSession={resetSession}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            onGoBack={handleCloseCatalog}
            onSelectStep={handleSelectStep}
          />
        </div>

        {/* Scrollable Showroom Content */}
        <div id="catalog-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden">
          {isCatalogOpen && (
            <SareeCatalogScreen
              customerImageUrl={session.capturedImageData || "/images/customer-sample.jpg"}
              selectedProductId={session.selectedProductId}
              selectedJewelId={session.selectedJewelId}
              onSelectProduct={selectProduct}
              onSelectJewel={selectJewel}
              onProceedToTryOn={handleProceedToTryOn}
              onBackToHome={handleCloseCatalog}
            />
          )}
        </div>
      </div>

      {/* ════════════════ LAYER 2: CAMERA & VTON EXPERIENCE SCREENS ════════════════ */}
      {session.currentStep !== "welcome" && session.currentStep !== "catalog" && (
        <div className="fixed inset-0 z-40 flex flex-col bg-[#160309] overflow-hidden">
          {/* Animated bokeh background */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div
              className="animate-bg-drift absolute inset-[-15%] w-[130%] h-[130%]"
              style={{
                backgroundImage: "url('/images/rokea-bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                willChange: "transform",
              }}
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Top Header */}
          <div className="relative z-10 shrink-0">
            <KioskHeader
              currentStep={session.currentStep}
              isCameraActive={cameraStatus === "active"}
              onResetSession={resetSession}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((prev) => !prev)}
              onGoBack={handleGoBack}
              onSelectStep={handleSelectStep}
            />
          </div>

          {/* Screen Content */}
          <div className="flex-1 overflow-y-auto relative z-10">
            {session.currentStep === "permission" && (
              <CameraPermissionScreen
                status={cameraStatus}
                errorMessage={cameraError}
                devices={devices}
                selectedDeviceId={selectedDeviceId}
                onSelectDevice={switchDevice}
                onRequestCamera={handleRequestCamera}
                onUseFallbackSilhouette={handleUseSampleSilhouette}
                onBack={handleGoBack}
              />
            )}

            {session.currentStep === "positioning" && (
              <LivePositioningScreen
                videoRef={videoRef}
                framingStatus={framingStatus}
                countdownRemaining={countdownRemaining}
                stabilityProgress={stabilityProgress}
                onManualCapture={handleCapture}
                onSwitchCamera={devices.length > 1 ? () => switchDevice(devices[1].deviceId) : undefined}
                onUseFallbackSilhouette={handleUseSampleSilhouette}
                isModelLoading={isModelLoading}
                modelError={modelError}
                onBack={handleGoBack}
              />
            )}

            {session.currentStep === "confirm" && session.capturedImageData && (
              <CaptureConfirmScreen
                capturedImageUrl={session.capturedImageData}
                capturedMeta={session.capturedMeta}
                onRetake={handleRetake}
                onConfirm={handleConfirmCapture}
                onBackToCatalog={() => {
                  setIsCatalogOpen(true);
                  goToStep("catalog");
                }}
              />
            )}

            {session.currentStep === "generating" && (
              <GenerationScreen
                customerImageUrl={session.capturedImageData || "/images/customer-sample.jpg"}
                selectedProduct={currentProduct}
                jobState={activeJobState}
                onCancel={() => {
                  mockVTONProvider.cancel();
                  setIsCatalogOpen(true);
                  goToStep("catalog");
                }}
              />
            )}

            {session.currentStep === "result" && session.tryonResult && (
              <ResultScreen
                customerImageUrl={session.capturedImageData || "/images/customer-sample.jpg"}
                resultImageUrl={session.tryonResult.resultImageUrl}
                selectedProduct={currentProduct}
                onTryAnotherSaree={handleTryAnotherSaree}
                onReportFeedback={() => setShowFeedbackModal(true)}
                onOpenQr={() => setShowQrModal(true)}
                onFinishSession={resetSession}
              />
            )}
          </div>
        </div>
      )}

      {/* Inactivity Warning Modal */}
      {showInactivityWarning && (
        <InactivityModal
          secondsLeft={inactivitySecondsLeft}
          onStay={pingActivity}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={submitFeedback}
        />
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <QrModal
          sessionId={session.sessionId}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <LanguageProvider>
      <KioskApp />
    </LanguageProvider>
  );
}
