"use client";

import { useSyncExternalStore } from "react";

export const REQUESTS_SOUND_EVENT = "requests-sound-change";
const REQUESTS_SOUND_STORAGE_KEY = "requests-sound";

let soundPreferenceHydrated = false;

function subscribeToSoundPreference(onStoreChange: () => void) {
  window.addEventListener(REQUESTS_SOUND_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  const timeoutId = window.setTimeout(() => {
    soundPreferenceHydrated = true;
    onStoreChange();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
    window.removeEventListener(REQUESTS_SOUND_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSoundPreferenceSnapshot() {
  if (!soundPreferenceHydrated) return false;

  return localStorage.getItem(REQUESTS_SOUND_STORAGE_KEY) === "on";
}

function getServerSoundPreferenceSnapshot() {
  return false;
}

export function useRequestsSoundPreference() {
  return useSyncExternalStore(subscribeToSoundPreference, getSoundPreferenceSnapshot, getServerSoundPreferenceSnapshot);
}

export function setRequestsSoundPreference(enabled: boolean) {
  if (enabled) {
    localStorage.setItem(REQUESTS_SOUND_STORAGE_KEY, "on");
  } else {
    localStorage.removeItem(REQUESTS_SOUND_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(REQUESTS_SOUND_EVENT));
}
