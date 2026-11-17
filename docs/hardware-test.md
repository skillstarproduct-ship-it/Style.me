# Rokea AI Saree VTON Kiosk — Hardware Validation & Calibration Log

This document serves as the hardware calibration template and test log for the Rokea Virtual Dressing Room Kiosk. Camera capture quality is the foundation of realistic saree virtual try-on. Use this template to log real display and camera mount configurations, optical field of view, lighting conditions, and capture test results across diverse customer profiles.

---

## 1. Hardware Specification & Setup Profile

- **Kiosk Unit ID / Location:** `KIOSK-BLR-01` (e.g. Flagship Store, Bengaluru)
- **Display Size & Orientation:** 55" Landscape Touchscreen (4K / 3840x2160, 60Hz)
- **Touch Technology:** Infrared Touch Overlay / Capacitive Glass
- **Host Machine:** Mini PC (Intel Core i7 13th Gen / Ryzen 7, 32GB RAM, Iris Xe / RTX 3050, Windows 11 IoT Enterprise)
- **Primary Camera Model:** Logitech Brio 4K / Obsbot Meet 2 / Sony ZV-E10 via HDMI Capture Card
- **Camera Resolution & Frame Rate:** 1080p @ 30fps (preview) / 4K @ 30fps (capture frame)
- **Camera Sensor & Lens:** Wide-angle low distortion, diagonal FOV ~90° / horizontal FOV ~78°
- **Camera Mount Position:** Top center of 55" display (height from floor: ~1.85 m)
- **Camera Mount Tilt Angle:** -6° downwards tilt towards the customer floor marker
- **Distance from Floor Marker to Display:** 2.4 meters (optimal customer standing spot)
- **Room Depth Available:** 3.5 meters unobstructed floor clearance
- **Ambient Lighting Environment:** 500-750 lux, high CRI (>90), twin diffused LED light bars mounted at 45° angles flanking the screen to eliminate harsh backlighting and shadows

---

## 2. Full-Body Optical Framing Calibration

To ensure customer privacy, zero video streaming, and fast responsive feedback, body-framing checks run **100% locally in-browser** using MediaPipe Pose Landmarker (WASM).

### Pass / Fail Criteria Matrix

| Parameter | Required Specification | Detection Logic | Acceptance Status |
| :--- | :--- | :--- | :--- |
| **Person Count** | Exactly 1 person | Landmarker detects single pose instance; rejects if 0 or >1 | [ ] PASS / [ ] FAIL |
| **Head In-Frame** | Crown & Nose inside bounds | `nose.y >= 0.05` and `nose.y <= 0.35` | [ ] PASS / [ ] FAIL |
| **Feet In-Frame** | Ankles & Foot index visible | `left_ankle.y <= 0.95` & `right_ankle.y <= 0.95` (visibility >= 0.65) | [ ] PASS / [ ] FAIL |
| **Center Alignment** | Midpoint of hips centered | `abs((left_hip.x + right_hip.x)/2 - 0.5) <= 0.18` | [ ] PASS / [ ] FAIL |
| **Lighting Quality** | Adequate luminance, low backlighting | Canvas histogram average luma >= 80, backlight ratio <= 1.8 | [ ] PASS / [ ] FAIL |
| **Motion Stability** | Stable pose for auto-capture | Landmark displacement < 0.015 over 2.0s window | [ ] PASS / [ ] FAIL |

---

## 3. Customer Height Calibration Matrix

Test each participant standing at the designated 2.4 m kiosk floor marker.

| Test ID | Participant Height | Proportions / Body Type | Head & Feet Visible? | Centered Message Valid? | Auto-Capture Countdown (2s) | Manual Capture | Result Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HT-01** | Petite (148 cm / 4'10") | Slender | [ ] Yes [ ] No | [ ] Normal | [ ] Triggered | [ ] Passed | Need slight tilt down or 2.2m marker |
| **HT-02** | Medium (158 cm / 5'2") | Average | [ ] Yes [ ] No | [ ] Normal | [ ] Triggered | [ ] Passed | Centered framing golden zone |
| **HT-03** | Tall (172 cm / 5'8") | Athletic | [ ] Yes [ ] No | [ ] Normal | [ ] Triggered | [ ] Passed | Head and feet clear |
| **HT-04** | Very Tall (185 cm / 6'1") | Broad | [ ] Yes [ ] No | [ ] Normal | [ ] Triggered | [ ] Passed | Feet close to bottom edge; 2.6m marker optimal |
| **HT-05** | Customer with Child | 2 people in frame | [ ] Rejects | Displays "Only one person" | [ ] Blocked | [ ] Blocked | Successfully prompts for single customer |
| **HT-06** | Dark/Low Light (200 lux) | Average | [ ] Warning | Prompts "Improve lighting" | [ ] Warned | [ ] Allowed | Soft warning chip shown |
| **HT-07** | Motion / Walking | Fast movement | [ ] Unstable | Prompts "Hold still for capture" | [ ] Resets timer | [ ] Allowed | Countdown smoothly pauses |

---

## 4. Hardware Checklist for On-Site Technicians

1. [ ] **Display Cleanliness:** Ensure protective glass is smudge-free and anti-glare treated.
2. [ ] **Camera Cable:** Secure USB 3.0 / USB-C connection directly to high-speed motherboard port (avoid unpowered hubs).
3. [ ] **Audio/Voice Feedback:** Kiosk speakers set to 60% ambient level for countdown chimes.
4. [ ] **Floor Vinyl Marker:** "Stand Here / இங்கே நிற்கவும்" marker adhered at 2.4 meters from screen center.
5. [ ] **Emergency Manual Controls:** Physical kiosk power switch and hidden service door key verified.
6. [ ] **Network & Offline Behavior:** Ensure client runs WASM pose landmarker offline without internet latency.
