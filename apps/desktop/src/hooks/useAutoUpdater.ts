import { useEffect, useRef } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { useTaskStore } from '@todone/store';

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const LS_LAST_CHECK = 'todone-last-update-check';
const LS_LAST_PROMPTED = 'todone-last-prompted-version';

export function useAutoUpdater() {
  const { setPendingUpdate, setUpdateModalOpen } = useTaskStore();
  // Prevent concurrent checks
  const isChecking = useRef(false);

  const checkForUpdate = async () => {
    if (isChecking.current) return;

    // ── Condition 1: 24-hour rate limiting ──────────────────────────────
    const lastCheck = localStorage.getItem(LS_LAST_CHECK);
    const now = Date.now();
    if (lastCheck && now - parseInt(lastCheck, 10) < CHECK_INTERVAL_MS) {
      return; // Not 24 hours yet → skip API call
    }

    isChecking.current = true;
    try {
      const update: Update | null = await check();
      localStorage.setItem(LS_LAST_CHECK, String(now));

      if (!update) return; // Already up to date

      // ── Condition 3: Store update object globally ────────────────────
      setPendingUpdate(update);

      // ── Condition 2: Show popup only once per new version ───────────
      const lastPrompted = localStorage.getItem(LS_LAST_PROMPTED);
      if (lastPrompted !== update.version) {
        setUpdateModalOpen(true);
        localStorage.setItem(LS_LAST_PROMPTED, update.version);
      }
    } catch (e) {
      // Silently ignore — network errors should not disrupt the user
      console.warn('[AutoUpdater] check failed:', e);
    } finally {
      isChecking.current = false;
    }
  };

  useEffect(() => {
    // Run once on mount (app open)
    checkForUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { checkForUpdate };
}
