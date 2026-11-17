import { TryOnJobState, TryOnJobStatus } from "./types";

export interface MockTryOnRequest {
  jobId: string;
  customerImage: string;
  productId: string;
  onProgress: (state: TryOnJobState) => void;
}

export class MockVTONProvider {
  private activeTimers: NodeJS.Timeout[] = [];

  cancel() {
    this.activeTimers.forEach((timer) => clearTimeout(timer));
    this.activeTimers = [];
  }

  async runMockTryOn({
    jobId,
    customerImage,
    productId,
    onProgress,
  }: MockTryOnRequest): Promise<string> {
    this.cancel();

    const startTime = Date.now();

    // Map result image based on selected product
    let resultImageUrl = "/images/vton-maroon-result.jpg";
    if (productId === "rok-banarasi-02") {
      resultImageUrl = "/images/vton-maroon-result.jpg"; // or customized result
    } else if (productId === "rok-kanchi-03") {
      resultImageUrl = "/images/vton-maroon-result.jpg";
    }

    const steps: {
      status: TryOnJobStatus;
      delayMs: number;
      progress: number;
      messageKey: string;
    }[] = [
      {
        status: "validating",
        delayMs: 400,
        progress: 15,
        messageKey: "generating.steps.validating",
      },
      {
        status: "queued",
        delayMs: 1800,
        progress: 35,
        messageKey: "generating.steps.queued",
      },
      {
        status: "processing",
        delayMs: 3800,
        progress: 68,
        messageKey: "generating.steps.processing",
      },
      {
        status: "quality_review",
        delayMs: 5800,
        progress: 88,
        messageKey: "generating.steps.quality",
      },
      {
        status: "completed",
        delayMs: 7200,
        progress: 100,
        messageKey: "generating.steps.completed",
      },
    ];

    return new Promise((resolve) => {
      steps.forEach((step, index) => {
        const timer = setTimeout(() => {
          const latency = Date.now() - startTime;
          const isFinal = index === steps.length - 1;

          onProgress({
            jobId,
            status: step.status,
            progressPercent: step.progress,
            currentMessageKey: step.messageKey,
            estimatedCost: 0.08, // ~$0.08 mock API cost
            latencyMs: latency,
            resultImageUrl: isFinal ? resultImageUrl : undefined,
          });

          if (isFinal) {
            resolve(resultImageUrl);
          }
        }, step.delayMs);

        this.activeTimers.push(timer);
      });
    });
  }
}

export const mockVTONProvider = new MockVTONProvider();
