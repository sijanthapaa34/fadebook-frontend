// src/api/pushNotificationService.ts
import messaging from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
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

// Modular-style helpers using getApp()
const getMessaging = () => messaging(getApp());

class NotificationService {
  private static instance: NotificationService;
  private constructor() {}
  static getInstance(): NotificationService {
    if (!NotificationService.instance) NotificationService.instance = new NotificationService();
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;
    }
    const m = getMessaging();
    const authStatus = await m.requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  async getToken(): Promise<string | null> {
    try {
      const m = getMessaging();
      if (Platform.OS === 'ios') {
        try { await m.registerDeviceForRemoteMessages(); } catch {}
      }
      console.log('🔄 Fetching FCM token...');
      const token = await m.getToken();
      console.log('✅ FCM Token:', token);
      if (token) {
        try {
          await api.post('/notifications/token', token, { headers: { 'Content-Type': 'text/plain' } });
        } catch {}
      }
      return token;
    } catch (error) {
      console.error('Failed to get/save token:', error);
      return null;
    }
  }

  async initialize(): Promise<(() => void) | null> {
    const hasPermission = await this.requestPermission();
    if (hasPermission) this.getToken().catch(() => {});
    return this.setupListeners();
  }

  setupListeners(): () => void {
    const m = getMessaging();

    const unsubForeground = m.onMessage(async (msg) => {
      this.handleForegroundMessage(msg);
    });

    const unsubBackground = m.onNotificationOpenedApp((msg) => {
      const data = this.extractData(msg);
      if (data) this.handleNotificationTap(data);
    });

    const unsubTokenRefresh = m.onTokenRefresh(async (newToken) => {
      try {
        await api.post('/notifications/token', newToken, { headers: { 'Content-Type': 'text/plain' } });
      } catch {}
    });

    return () => { unsubForeground(); unsubBackground(); unsubTokenRefresh(); };
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
      case 'APPOINTMENT_BOOKED': case 'NEW_APPOINTMENT':
      case 'APPOINTMENT_RESCHEDULED': case 'APPOINTMENT_CANCELLED':
        navigationRef.navigate('CustomerAppointments' as never); break;
      case 'NEW_REVIEW':
        if (data.shopId) navigationRef.navigate('ShopDetail' as never, { shopId: Number(data.shopId) } as never);
        break;
      case 'REVIEW_REPLY': navigationRef.navigate('CustomerAppointments' as never); break;
      case 'NEW_APPLICATION': case 'APPLICATION_STATUS':
        navigationRef.navigate('CustomerProfile' as never); break;
    }
  }
}

export default NotificationService.getInstance();
