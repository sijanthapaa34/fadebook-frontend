// src/api/pushNotificationService.ts
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import api from './api';

export type NotificationType =
  | 'APPOINTMENT_BOOKED' | 'NEW_APPOINTMENT' | 'NEW_REVIEW'
  | 'REVIEW_REPLY' | 'NEW_APPLICATION' | 'APPLICATION_STATUS'
  | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_RESCHEDULED' | 'GENERAL';

export interface PushNotificationData {
  title: string; body: string; type: NotificationType; timestamp: string;
  shopName?: string; barberName?: string; customerName?: string;
  serviceName?: string; rating?: string; appointmentId?: string; shopId?: string;
}

let navigationRef: any = null;
export const setNotificationNavigationRef = (ref: any) => { navigationRef = ref; };

class NotificationService {
  private static instance: NotificationService;
  private constructor() {}
  static getInstance(): NotificationService {
    if (!NotificationService.instance) NotificationService.instance = new NotificationService();
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;
    }
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  async getToken(): Promise<string | null> {
    try {
      console.log('=== Getting FCM Token ===');
      
      // Must register before getToken on iOS
      await messaging().registerDeviceForRemoteMessages();
      console.log('Registered device for remote messages');
      
      const token = await messaging().getToken();
      console.log('FCM Token obtained:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (token) {
        try {
          console.log('Sending token to backend...');
          await api.post('/notifications/token', token, {
            headers: { 'Content-Type': 'text/plain' },
          });
          console.log('Token successfully sent to backend');
        } catch (error: any) {
          console.error('Failed to send token to backend:', error.response?.data || error.message);
          throw error;
        }
      } else {
        console.warn('No FCM token obtained');
      }
      
      console.log('========================');
      return token;
    } catch (error: any) {
      // Suppress the noisy unregistered error — it resolves after registerDeviceForRemoteMessages
      if (error?.code !== 'messaging/unregistered') {
        console.error('FCM token error:', error?.message ?? error);
      }
      return null;
    }
  }

  async initialize(): Promise<(() => void) | null> {
    const hasPermission = await this.requestPermission();
    if (hasPermission) this.getToken().catch(() => {});
    return this.setupListeners();
  }

  setupListeners(): () => void {
    const unsubForeground = messaging().onMessage(async (msg) => {
      this.handleForegroundMessage(msg);
    });

    const unsubBackground = messaging().onNotificationOpenedApp((msg) => {
      const data = this.extractData(msg);
      if (data) this.handleNotificationTap(data);
    });

    const unsubTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      try {
        await api.post('/notifications/token', newToken, {
          headers: { 'Content-Type': 'text/plain' },
        });
      } catch {}
    });

    return () => {
      unsubForeground();
      unsubBackground();
      unsubTokenRefresh();
    };
  }

  private handleForegroundMessage(remoteMessage: any): void {
    const title = remoteMessage.notification?.title || remoteMessage.data?.title || 'New Notification';
    const body = remoteMessage.notification?.body || remoteMessage.data?.body || '';
    const data = this.extractData(remoteMessage);
    import('react-native').then(({ Alert }) => {
      Alert.alert(title, body, [
        { text: 'Dismiss', style: 'cancel' },
        { text: 'View', onPress: () => { if (data) this.handleNotificationTap(data); } },
      ]);
    });
  }

  private extractData(remoteMessage: any): PushNotificationData | null {
    return remoteMessage.data ? (remoteMessage.data as PushNotificationData) : null;
  }

  private handleNotificationTap(data: PushNotificationData): void {
    if (!navigationRef) return;
    switch (data.type) {
      case 'APPOINTMENT_BOOKED':
      case 'NEW_APPOINTMENT':
      case 'APPOINTMENT_RESCHEDULED':
      case 'APPOINTMENT_CANCELLED':
        navigationRef.navigate('CustomerAppointments' as never);
        break;
      case 'NEW_REVIEW':
        if (data.shopId) {
          navigationRef.navigate('ShopDetail' as never, { shopId: Number(data.shopId) } as never);
        }
        break;
      case 'REVIEW_REPLY':
        navigationRef.navigate('CustomerAppointments' as never);
        break;
      case 'NEW_APPLICATION':
      case 'APPLICATION_STATUS':
        navigationRef.navigate('CustomerProfile' as never);
        break;
    }
  }
}

export default NotificationService.getInstance();
