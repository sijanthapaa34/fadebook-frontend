import { messaging } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { saveToken } from '@/services/notificationService';

const vapidKey = 'BN5nPPEDRdfZwbBGnbwQZcG5zPwsF0XlP3CuStMqq-znJrzq0ulgDBwWz1KHgxUrmzEVfg7NYTKxFtFdgEj_Ggk';

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    if (!('Notification' in window)) return null;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const token = await getToken(messaging, { vapidKey });
    if (token) {
      console.log('[FCM] Web token:', token);
      await saveToken(token);
    }
    return token;
  } catch (error) {
    console.error('[FCM] Error getting web token:', error);
    return null;
  }
}

export function onForegroundMessage() {
  onMessage(messaging, (payload) => {
    console.log('[FCM] Foreground message:', payload);
    const { title, body } = payload.notification || {};
    if (title) {
      import('@/hooks/use-toast').then(({ useToast }) => {
        // Can't call hooks outside components — use a custom event instead
        window.dispatchEvent(new CustomEvent('fcm-notification', {
          detail: { title, body }
        }));
      });
    }
  });
}
