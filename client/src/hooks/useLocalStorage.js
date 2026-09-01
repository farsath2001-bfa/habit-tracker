import { useState, useEffect, useCallback } from 'react';

// A same-tab broadcast channel: the native 'storage' event only fires in
// OTHER tabs/windows, never in the tab that made the change. Without this,
// two components in the same tab that both call useLocalStorage(sameKey)
// go out of sync the instant one of them changes the value - e.g. a toggle
// in Settings.jsx would visually turn "on" but a persistent layout
// component's own copy of that same key would never find out.
const EVENT_NAME = 'habit_tracker_storage_sync';

const readStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

/** A useState that persists its value to localStorage under `key`, and stays
 * in sync with every other component (in this tab or another tab) using the
 * same key. */
export default function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => readStorage(key, defaultValue));

  // Write-through: persist this instance's value and tell every other
  // instance (same tab) that this key changed.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // ignore storage errors
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key } }));
  }, [key, value]);

  // Read-through: if this key changes anywhere else (another component in
  // this tab, or another tab entirely), pull the fresh value in.
  const syncFromStorage = useCallback(
    (e) => {
      if (e.type === 'storage' && e.key !== null && e.key !== key) return;
      if (e.type === EVENT_NAME && e.detail?.key !== key) return;
      setValue(readStorage(key, defaultValue));
    },
    [key, defaultValue]
  );

  useEffect(() => {
    window.addEventListener('storage', syncFromStorage); // cross-tab
    window.addEventListener(EVENT_NAME, syncFromStorage); // same-tab
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener(EVENT_NAME, syncFromStorage);
    };
  }, [syncFromStorage]);

  return [value, setValue];
}