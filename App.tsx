// App.tsx
import React, { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';

// ✅ NEW: Import notification service
import notificationService from './src/api/pushNotificationService';

const queryClient = new QueryClient();

export default function App() {
  // ✅ NEW: Cleanup ref for notification listeners
  const cleanupRef = useRef<(() => void) | null>(null);

  // ✅ UPDATED: Only setup notification listeners, don't get token yet
  // Token will be registered after login in authStore.ts
  useEffect(() => {
    const setupNotifications = async () => {
      // Request permissions
      await notificationService.requestPermission();
      
      // Setup listeners for foreground/background notifications
      const cleanup = notificationService.setupListeners();
      cleanupRef.current = cleanup;
    };

    setupNotifications();

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}