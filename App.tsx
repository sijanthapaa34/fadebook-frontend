import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { navigationRef } from './src/navigation/NavigationService';
import { useAuthStore } from './src/store/authStore';

// screens
import Landing from './src/screens/LandingScreen';
import Login from './src/screens/LoginScreen';
import Register from './src/screens/RegisterScreen';
import CustomerDashboard from './src/screens/customer/CustomerDashboardScreen';
import BookAppointment from './src/screens/customer/BookAppointmentScreen';
import BarberDashboard from './src/screens/barber/BarberDashboardScreen';
import NotFound from './src/screens/NotFoundScreen';

// -------------------- React Query --------------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// -------------------- Navigation types --------------------
export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  CustomerDashboard: undefined;
  BookAppointment: { barberId?: string };
  BarberDashboard: undefined;
  NotFound: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// -------------------- App --------------------
export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // Get auth store
  const logout = useAuthStore((s) => s.logout);
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  // -------------------- Fresh logout on app start --------------------
  useEffect(() => {
    const resetAuth = async () => {
      await logout();       // clear any saved token
      // optionally, you can still call initialize() if needed
      // await initialize();
    };
    resetAuth();
  }, [logout, initialize]);

  const role = user?.role;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: isDarkMode ? '#0A0A0A' : '#FFFFFF',
              },
            }}
          >
            {/* ---------------- PUBLIC ---------------- */}
            {!isAuthenticated && (
              <>
                <Stack.Screen name="Landing" component={Landing} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
              </>
            )}

            {/* ---------------- CUSTOMER ---------------- */}
            {isAuthenticated && role === 'CUSTOMER' && (
              <>
                <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
                <Stack.Screen name="BookAppointment" component={BookAppointment} />
              </>
            )}

            {/* ---------------- BARBER ---------------- */}
            {isAuthenticated && role === 'BARBER' && (
              <Stack.Screen name="BarberDashboard" component={BarberDashboard} />
            )}

            {/* ---------------- FALLBACK ---------------- */}
            <Stack.Screen name="NotFound" component={NotFound} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
