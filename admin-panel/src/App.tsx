// src/App.tsx
import AppNavigator from './navigation/AppNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/toast';
import { useEffect } from 'react';
import { onForegroundMessage, requestNotificationPermission } from '@/lib/notifications';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function AppInner() {
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    onForegroundMessage();
  }, []);

  useEffect(() => {
    // Request web push permission and register token once user is logged in
    if (user) {
      requestNotificationPermission().catch(() => {});
    }
  }, [user?.id]);

  return (
    <>
      <AppNavigator />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;