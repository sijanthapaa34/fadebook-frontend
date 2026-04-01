// src/hooks/useNotificationBadge.ts
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import notificationService from '../api/pushNotificationService';
import { eventEmitter } from '../api/eventEmitter';

export const useNotificationBadge = () => {
  const [count, setCount] = useState(0);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Only fetch if user is logged in
    if (!user) {
      setCount(0);
      return;
    }

    // const fetchCount = async () => {
    //   const unreadCount = await notificationService.getUnreadCount();
    //   setCount(unreadCount);
    // };

    // fetchCount();

    // Listen for new notifications to increment badge
    const unsubscribe = eventEmitter.on('notification', () => {
      setCount(prev => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  return count;
};