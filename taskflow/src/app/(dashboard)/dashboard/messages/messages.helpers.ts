"use client";

import type { CSSProperties } from "react";

export type ChatUser = {
  Id: string;
  FullName: string;
  Email?: string | null;
  AvatarUrl?: string | null;
};

export type UserProfile = {
  UserId: string;
  AvatarUrl?: string | null;
};

export type ChatMessage = {
  Id: string;
  SenderId: string;
  ReceiverId: string;
  Content: string;
  CreatedAt: string;
};

export type ChatWallpaper = {
  id: string;
  label?: string;
  style?: CSSProperties;
  url?: string;
};

export const WALLPAPER_PRESETS: ChatWallpaper[] = [
  { id: "default", label: "Mặc định", style: { backgroundColor: "#f8fafc", backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)", backgroundSize: "20px 20px" } },
  { id: "indigo", label: "Indigo", style: { background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)" } },
  { id: "rose", label: "Rose", style: { background: "linear-gradient(135deg, #fff1f2 0%, #fdf4ff 100%)" } },
  { id: "emerald", label: "Emerald", style: { background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)" } },
  { id: "amber", label: "Amber", style: { background: "linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%)" } },
  { id: "slate", label: "Slate Dark", style: { background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" } },
  { id: "ocean", label: "Ocean", style: { background: "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)" } },
  { id: "aurora", label: "Aurora", style: { background: "linear-gradient(135deg, #fae8ff 0%, #dbeafe 50%, #dcfce7 100%)" } },
];

export function createMessageId() {
  return "msg_" + Math.random().toString(36).substring(2, 8);
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Không thể đọc file."));
    reader.readAsDataURL(file);
  });
}

export function getStoredWallpaper(chatId: string): ChatWallpaper {
  const saved = localStorage.getItem(`wallpaper_${chatId}`);
  if (!saved) return WALLPAPER_PRESETS[0];

  try {
    return JSON.parse(saved) as ChatWallpaper;
  } catch {
    return WALLPAPER_PRESETS[0];
  }
}

export function storeWallpaper(chatId: string, wallpaper: ChatWallpaper) {
  localStorage.setItem(`wallpaper_${chatId}`, JSON.stringify(wallpaper));
}

export function createCustomWallpaper(url: string): ChatWallpaper {
  return {
    id: "custom",
    url,
    style: {
      backgroundImage: `url(${url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
  };
}

export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  } catch {
    // Notification sound is best-effort only.
  }
}
