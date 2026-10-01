import { differenceInCalendarDays, parseISO, isValid, format, startOfDay } from 'date-fns';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Task, InAppNotification } from '../types';

const SENT_KEYS_STORAGE = 'zenith_sent_notifications';
const IN_APP_STORAGE = 'zenith_in_app_notifications';

export function getSentTriggerKeys(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SENT_KEYS_STORAGE);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function markTriggerSent(key: string) {
  try {
    const keys = getSentTriggerKeys();
    keys[key] = new Date().toISOString();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    for (const [k, timestamp] of Object.entries(keys)) {
      if (new Date(timestamp).getTime() < thirtyDaysAgo) {
        delete keys[k];
      }
    }
    localStorage.setItem(SENT_KEYS_STORAGE, JSON.stringify(keys));
  } catch (e) {
    console.warn('Could not persist sent notification key', e);
  }
}

export function getStoredInAppNotifications(): InAppNotification[] {
  try {
    const raw = localStorage.getItem(IN_APP_STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredInAppNotifications(notifications: InAppNotification[]) {
  try {
    localStorage.setItem(IN_APP_STORAGE, JSON.stringify(notifications.slice(0, 50)));
  } catch (e) {
    console.warn('Could not persist in-app notifications', e);
  }
}

// Trigger haptic feedback safely
export async function triggerHaptic(style: ImpactStyle = ImpactStyle.Light) {
  try {
    await Haptics.impact({ style });
  } catch (e) {
    // browser or web environment fallback
  }
}

/**
 * Checks all active tasks against due date rules and generates in-app notifications.
 */
export function checkTaskNotifications(
  tasks: Task[],
  onNewNotification?: (notification: InAppNotification) => void
): InAppNotification[] {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];

  const today = startOfDay(new Date());
  const todayKeyStr = format(today, 'yyyy-MM-dd');
  const sentKeys = getSentTriggerKeys();
  const existingNotifications = getStoredInAppNotifications();
  const newlyCreated: InAppNotification[] = [];

  tasks.forEach((task) => {
    if (!task || task.status === 'completed') return;

    if (task.dueDate) {
      const parsedDue = parseISO(task.dueDate);
      if (isValid(parsedDue)) {
        const daysDiff = differenceInCalendarDays(parsedDue, today);

        // 1. Due Today Rule
        if (daysDiff === 0) {
          const triggerKey = `due_today_${task.id}_${todayKeyStr}`;
          if (!sentKeys[triggerKey]) {
            markTriggerSent(triggerKey);
            const notif: InAppNotification = {
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              taskId: task.id,
              title: `Task Due Today: "${task.title}"`,
              message: `This task is scheduled for completion today (${format(parsedDue, 'MMM d')}). Priority: ${task.priority.toUpperCase()}.`,
              type: 'due',
              timestamp: new Date().toISOString(),
              read: false
            };
            newlyCreated.push(notif);
            if (onNewNotification) onNewNotification(notif);
          }
        }

        // 2. Overdue Rule
        if (daysDiff < 0) {
          const overdueDays = Math.abs(daysDiff);
          const triggerKey = `overdue_${task.id}_day_${overdueDays}`;
          if (!sentKeys[triggerKey]) {
            markTriggerSent(triggerKey);
            const notif: InAppNotification = {
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              taskId: task.id,
              title: `Task Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}!`,
              message: `"${task.title}" was due on ${format(parsedDue, 'MMM d')}. Please update its status or reschedule.`,
              type: 'overdue',
              timestamp: new Date().toISOString(),
              read: false
            };
            newlyCreated.push(notif);
            if (onNewNotification) onNewNotification(notif);
          }
        }
      }
    }

    // 3. Urgent Needs Help Alert
    if (task.needHelpFrom && task.needHelpFrom.name && task.priority === 'urgent') {
      const triggerKey = `help_urgent_${task.id}_${todayKeyStr}`;
      if (!sentKeys[triggerKey]) {
        markTriggerSent(triggerKey);
        const notif: InAppNotification = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          taskId: task.id,
          title: `Urgent Help Requested: "${task.title}"`,
          message: `${task.needHelpFrom.name} is tagged for assistance${task.needHelpFrom.topic ? ` with: ${task.needHelpFrom.topic}` : ''}.`,
          type: 'help',
          timestamp: new Date().toISOString(),
          read: false
        };
        newlyCreated.push(notif);
        if (onNewNotification) onNewNotification(notif);
      }
    }
  });

  if (newlyCreated.length > 0) {
    const combined = [...newlyCreated, ...existingNotifications].slice(0, 50);
    saveStoredInAppNotifications(combined);
    return combined;
  }

  return existingNotifications;
}

/**
 * Fires notification when a task is completed
 */
export function notifyTaskCompleted(task: Task, onNotification?: (n: InAppNotification) => void) {
  if (!task) return;
  const notif: InAppNotification = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    taskId: task.id,
    title: `Task Completed!`,
    message: `"${task.title}" was marked as completed. Awesome progress!`,
    type: 'completed',
    timestamp: new Date().toISOString(),
    read: false
  };

  const existing = getStoredInAppNotifications();
  const updated = [notif, ...existing].slice(0, 50);
  saveStoredInAppNotifications(updated);
  if (onNotification) onNotification(notif);
  triggerHaptic(ImpactStyle.Medium);
}
