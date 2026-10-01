import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { InAppNotification } from '../types';
import { 
  getStoredInAppNotifications, 
  saveStoredInAppNotifications,
  triggerHaptic 
} from '../services/notificationService';
import { ImpactStyle } from '@capacitor/haptics';

interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  activeToast: InAppNotification | null;
  clearActiveToast: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  pushNotification: (notification: InAppNotification) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    return getStoredInAppNotifications();
  });

  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const clearActiveToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const pushNotification = useCallback((notification: InAppNotification) => {
    setNotifications((prev) => {
      const updated = [notification, ...prev.filter((n) => n.id !== notification.id)].slice(0, 50);
      saveStoredInAppNotifications(updated);
      return updated;
    });
    setActiveToast(notification);
    triggerHaptic(ImpactStyle.Light);

    // Auto dismiss toast after 4.5 seconds
    setTimeout(() => {
      setActiveToast((current) => (current?.id === notification.id ? null : current));
    }, 4500);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveStoredInAppNotifications(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveStoredInAppNotifications(updated);
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    saveStoredInAppNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    activeToast,
    clearActiveToast,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    pushNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
