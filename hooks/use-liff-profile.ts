"use client";

import { useState } from "react";

export interface LiffUserProfile {
  userId: string;
  displayName: string;
  mode: "liff" | "simulation";
}

const DEMO_LINE_PROFILES: readonly LiffUserProfile[] = [
  {
    userId: "U-LINE-8801",
    displayName: "คุณสมชาย (LINE LIFF)",
    mode: "simulation",
  },
  {
    userId: "U-LINE-8802",
    displayName: "คุณนภา (LINE LIFF)",
    mode: "simulation",
  },
  {
    userId: "U-LINE-9999",
    displayName: "ท่านประธาน (VIP LINE)",
    mode: "simulation",
  },
];

export function useLiffProfile() {
  const [profileIndex, setProfileIndex] = useState(0);
  const currentProfile = DEMO_LINE_PROFILES[profileIndex];

  const cycleProfile = () => {
    setProfileIndex((prev) => (prev + 1) % DEMO_LINE_PROFILES.length);
  };

  return {
    profile: currentProfile,
    cycleProfile,
  };
}
