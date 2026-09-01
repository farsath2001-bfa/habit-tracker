import { useEffect, useRef } from 'react';
import * as habitService from '../services/habitService';
import * as completionService from '../services/completionService';
import { toDateKey, isHabitScheduledOnDate } from '../utils/dateUtils';

const CHECK_INTERVAL_MS = 60 * 1000; // re-check once a minute
const notifiedStorageKey = (habitId, dateKey) => `habit_tracker_notified_${habitId}_${dateKey}`;

/**
 * While `enabled`, polls once a minute for habits that are scheduled today,
 * not yet completed, and whose reminderTime (set per-habit in the habit
 * form) has already passed - then fires one browser Notification per habit
 * per day.
 *
 * IMPORTANT LIMITATION: this uses the plain Notification API, not push
 * notifications, so it only fires while this app is open in a browser tab
 * (it doesn't need to be the active/focused tab, but the browser does need
 * to be running). There's no server-side scheduling here.
 *
 * Requesting permission is intentionally NOT done inside this hook - browsers
 * want that triggered by a real user click, so the caller (the Settings
 * toggle) calls Notification.requestPermission() itself before enabling.
 */
export default function useHabitReminders(enabled) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled || typeof Notification === 'undefined') return undefined;

    const check = async () => {
      if (Notification.permission !== 'granted') return;

      try {
        const todayKey = toDateKey(new Date());
        const nowHHMM = new Date().toTimeString().slice(0, 5); // 'HH:MM' local time

        const [habits, completions] = await Promise.all([
          habitService.getHabits(),
          completionService.getCompletions({ from: todayKey, to: todayKey }),
        ]);

        const completedIds = new Set(
          completions
            .filter((c) => c.completed && toDateKey(c.date) === todayKey)
            .map((c) => String(c.habit))
        );

        habits.forEach((habit) => {
          if (habit.archived) return;
          if (!habit.reminderTime) return;
          if (habit.reminderTime > nowHHMM) return; // reminder time hasn't arrived yet
          if (!isHabitScheduledOnDate(habit, todayKey)) return;
          if (completedIds.has(String(habit._id))) return;

          const storageKey = notifiedStorageKey(habit._id, todayKey);
          if (localStorage.getItem(storageKey)) return; // already notified today

                    try {
            new Notification(`${habit.icon || '✅'} ${habit.name}`, {
              body: "You haven't marked this done yet today.",
              tag: storageKey,
            });
          } catch (notifyErr) {
            // Some browsers (notably mobile Chrome/Android) don't support
            // calling `new Notification()` directly from a page - it needs
            // a service worker there. Log it so it's visible in devtools
            // instead of silently vanishing, and don't let it block the
            // rest of the habits in this pass.
            console.warn('[reminders] could not show notification for', habit.name, notifyErr);
            return;
          }

          try {
            localStorage.setItem(storageKey, '1');
          } catch (e) {
            // ignore storage errors (private browsing, quota, etc.)
          }
        });
            } catch (e) {
        // A failed check (e.g. a network hiccup) just means we try again
        // next interval - but log it so it's not invisible in devtools.
        console.warn('[reminders] check failed', e);
      }
    };

       check();
    timerRef.current = setInterval(check, CHECK_INTERVAL_MS);

    // Backgrounded/inactive tabs get their setInterval heavily throttled by
    // the browser (sometimes paused for minutes), so a reminder time that
    // passed while you were away from this tab can sit unfired until the
    // next tick. Catching up the instant the tab becomes visible again
    // closes that gap instead of making you wait.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled]);
}