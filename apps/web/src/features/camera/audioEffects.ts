"use client";

class SoundManager {
  // Sound effects disabled
  playBeep(_frequency?: number, _duration?: number) {}
  playCaptureChime() {}
}

export const soundManager = new SoundManager();
