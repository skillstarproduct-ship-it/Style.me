import { FramingStatus, LandmarkPoint } from "./types";

// Pose landmark indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

export interface FrameEvaluationInput {
  poses: LandmarkPoint[][];
  canvasContext?: CanvasRenderingContext2D | null;
  videoWidth?: number;
  videoHeight?: number;
  previousLandmarks?: LandmarkPoint[] | null;
}

/**
 * Evaluates the full-body posture against kiosk VTON acceptance criteria
 */
export function evaluateFramingQuality(input: FrameEvaluationInput): FramingStatus {
  const { poses, canvasContext, videoWidth = 640, videoHeight = 480, previousLandmarks } = input;

  // 1. Check person count
  if (!poses || poses.length === 0) {
    return {
      hasPerson: false,
      multiplePeople: false,
      headInFrame: false,
      feetInFrame: false,
      isCentered: false,
      distanceStatus: "unknown",
      lightingStatus: "good",
      isSteady: false,
      isFramingPerfect: false,
      guidanceKey: "noPerson",
      confidence: 0,
    };
  }

  if (poses.length > 1) {
    return {
      hasPerson: true,
      multiplePeople: true,
      headInFrame: false,
      feetInFrame: false,
      isCentered: false,
      distanceStatus: "unknown",
      lightingStatus: "good",
      isSteady: false,
      isFramingPerfect: false,
      guidanceKey: "multiPerson",
      confidence: 0.5,
    };
  }

  const landmarks = poses[0];
  const nose = landmarks[POSE_LANDMARKS.NOSE];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
  const leftFoot = landmarks[POSE_LANDMARKS.LEFT_FOOT_INDEX];
  const rightFoot = landmarks[POSE_LANDMARKS.RIGHT_FOOT_INDEX];

  // 2. Head in frame check
  // Nose must be inside 0.03 to 0.38 of frame height
  const headInFrame = !!nose && nose.y >= 0.03 && nose.y <= 0.40;
  const isHeadCutOff = !!nose && nose.y < 0.03;

  // 3. Feet in frame check
  // Ankle or foot index must be detected with good visibility and not cut off at the bottom
  const ankleVis = Math.max(leftAnkle?.visibility ?? 1, rightAnkle?.visibility ?? 1);
  const footVis = Math.max(leftFoot?.visibility ?? 1, rightFoot?.visibility ?? 1);
  const lowestY = Math.max(
    leftAnkle?.y ?? 0,
    rightAnkle?.y ?? 0,
    leftFoot?.y ?? 0,
    rightFoot?.y ?? 0
  );

  const feetDetected = (ankleVis > 0.4 || footVis > 0.4) && lowestY > 0.5;
  const feetInFrame = feetDetected && lowestY <= 0.97;
  const isFeetCutOff = !feetInFrame;

  // 4. Centering check
  const midHipX = leftHip && rightHip ? (leftHip.x + rightHip.x) / 2 : nose?.x ?? 0.5;
  const isCentered = Math.abs(midHipX - 0.5) <= 0.18;

  // 5. Distance check
  // Calculate total body span in normalized coordinates
  const topY = nose?.y ?? 0.1;
  const bottomY = lowestY > 0 ? lowestY : 0.9;
  const bodyHeightSpan = bottomY - topY;

  let distanceStatus: "optimal" | "too_close" | "too_far" = "optimal";
  if (bodyHeightSpan > 0.93) {
    distanceStatus = "too_close";
  } else if (bodyHeightSpan < 0.45) {
    distanceStatus = "too_far";
  }

  // 6. Lighting / Luminance check
  let lightingStatus: "good" | "low" | "backlit" = "good";
  if (canvasContext && videoWidth > 0 && videoHeight > 0) {
    try {
      // Sample central chest/torso region
      const sampleX = Math.floor(videoWidth * 0.4);
      const sampleY = Math.floor(videoHeight * 0.3);
      const sampleW = Math.floor(videoWidth * 0.2);
      const sampleH = Math.floor(videoHeight * 0.3);

      const imgData = canvasContext.getImageData(sampleX, sampleY, sampleW, sampleH);
      const data = imgData.data;
      let totalLuma = 0;
      const count = data.length / 4;

      for (let i = 0; i < data.length; i += 16) {
        // Step by 4 pixels for performance
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuma += luma;
      }

      const avgLuma = totalLuma / (count / 4);
      if (avgLuma < 45) {
        lightingStatus = "low";
      }
    } catch (e) {
      // ignore context read errors (e.g. tainted canvas)
    }
  }

  // 7. Motion Stability check
  let isSteady = true;
  if (previousLandmarks && previousLandmarks.length > 0 && landmarks.length > 0) {
    // Check key anchor joints: nose, shoulders, hips
    const keyIndices = [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER];
    let totalDelta = 0;
    for (const idx of keyIndices) {
      const p1 = previousLandmarks[idx];
      const p2 = landmarks[idx];
      if (p1 && p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        totalDelta += Math.sqrt(dx * dx + dy * dy);
      }
    }
    const avgMovement = totalDelta / keyIndices.length;
    // Movement threshold (0.015 is ~1.5% of frame)
    isSteady = avgMovement < 0.022;
  }

  // 8. Determine guidance message key
  let guidanceKey = "perfect";
  let isFramingPerfect = false;

  if (isHeadCutOff) {
    guidanceKey = "headCut";
  } else if (isFeetCutOff) {
    guidanceKey = "feetCut";
  } else if (!isCentered) {
    guidanceKey = "offCenter";
  } else if (distanceStatus === "too_close") {
    guidanceKey = "tooClose";
  } else if (distanceStatus === "too_far") {
    guidanceKey = "tooFar";
  } else if (lightingStatus === "low") {
    guidanceKey = "lowLight";
  } else if (!isSteady) {
    guidanceKey = "unsteady";
  } else {
    isFramingPerfect = true;
    guidanceKey = "perfect";
  }

  return {
    hasPerson: true,
    multiplePeople: false,
    headInFrame,
    feetInFrame,
    isCentered,
    distanceStatus,
    lightingStatus,
    isSteady,
    isFramingPerfect,
    guidanceKey,
    confidence: 0.95,
  };
}
