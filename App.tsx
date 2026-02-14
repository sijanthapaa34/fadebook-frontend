// App.tsx
import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { navigationRef } from './src/navigation/NavigationService';
import { useAuthStore } from './src/store/authStore';
import type { RootStackParamList } from './src/navigation/NavigationService';

// Layouts
import DashboardLayout from './src/components/layout/DashboardLayout';
import PublicLayout from './src/components/layout/PublicLayout';

// Screens
import Landing from './src/screens/LandingScreen';
import Login from './src/screens/LoginScreen';
import Register from './src/screens/RegisterScreen';
import About from './src/screens/AboutScreen';
import Contact from './src/screens/ContactScreen';
import CustomerDashboard from './src/screens/customer/CustomerDashboardScreen';
// import CustomerAppointments from './src/screens/customer/CustomerAppointmentsScreen';
// import CustomerPayments from './src/screens/customer/CustomerPaymentsScreen';
// import CustomerChat from './src/screens/customer/CustomerChatScreen';
// import CustomerProfile from './src/screens/customer/CustomerProfileScreen';
// import BookAppointment from './src/screens/customer/BookAppointmentScreen';
// import BarberDashboard from './src/screens/barber/BarberDashboardScreen';
// import BarberSchedule from './src/screens/barber/BarberScheduleScreen';
// import BarberEarnings from './src/screens/barber/BarberEarningsScreen';
// import BarberProfile from './src/screens/barber/BarberProfileScreen';
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

const Stack = createNativeStackNavigator<RootStackParamList>();

// -------------------- App --------------------
export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // Get auth store
  const initialize = useAuthStore((s) => s.initialize);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  // Initialize auth on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  const role = user?.role;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: '#0A0A0A',
              },
            }}
          >
            {/* ---------------- PUBLIC (Not Authenticated) ---------------- */}
            {!isAuthenticated && (
              <>
                <Stack.Screen name="Landing">
                  {() => (
                    <PublicLayout>
                      <Landing />
                    </PublicLayout>
                  )}
                </Stack.Screen>
                
                <Stack.Screen name="Login">
                  {() => (
                    <PublicLayout>
                      <Login />
                    </PublicLayout>
                  )}
                </Stack.Screen>
                
                <Stack.Screen name="Register">
                  {() => (
                    <PublicLayout>
                      <Register />
                    </PublicLayout>
                  )}
                </Stack.Screen>
                
                <Stack.Screen name="About">
                  {() => (
                    <PublicLayout>
                      <About />
                    </PublicLayout>
                  )}
                </Stack.Screen>
                
                <Stack.Screen name="Contact">
                  {() => (
                    <PublicLayout>
                      <Contact />
                    </PublicLayout>
                  )}
                </Stack.Screen>
              </>
            )}

            {/* ---------------- CUSTOMER ---------------- */}
            {isAuthenticated && role === 'CUSTOMER' && (
              <>
                <Stack.Screen name="CustomerDashboard">
                  {() => (
                    <DashboardLayout user={user!} onLogout={logout}>
                      <CustomerDashboard />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
                
                {/* <Stack.Screen name="CustomerAppointments">
                  {() => (
                    <DashboardLayout user={user!} onLogout={logout}>
                      <CustomerAppointments />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
                
                <Stack.Screen name="CustomerPayments">
                  {() => (
                    <DashboardLayout user={user!} onLogout={logout}>
                      <CustomerPayments />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
                
                <Stack.Screen name="CustomerChat">
                  {() => (
                    <DashboardLayout user={user!} onLogout={logout}>
                      <CustomerChat />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
                
                <Stack.Screen name="CustomerProfile">
                  {() => (
                    <DashboardLayout user={user!} onLogout={logout}>
                      <CustomerProfile />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
                
                <Stack.Screen name="BookAppointment">
                  {() => (
                    <DashboardLayout user={user!} onLogout={logout}>
                      <BookAppointment />
                    </DashboardLayout>
                  )}
                </Stack.Screen> */}
              </>
            )}

            {/* ---------------- BARBER ---------------- */}
            {/* {isAuthenticated && role === 'BARBER' && (
              <>
                <Stack.Screen name="BarberDashboard">
                  {() => (
                    <DashboardLayout user={user!} onLogout={logout}>
                      <BarberDashboard />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
                
                <Stack.Screen name="BarberSchedule">
                  {() => (
                    <DashboardLayout user={user!} onLogout={logout}>
                      <BarberSchedule />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
                
                <Stack.Screen name="BarberEarnings">
                  {() => (
                    <DashboardLayout user={user!} onLogout={logout}>
                      <BarberEarnings />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
                
                <Stack.Screen name="BarberProfile">
                  {() => (
                    <DashboardLayout user={user!} onLogout={logout}>
                      <BarberProfile />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
              </>
            )} */}

            {/* ---------------- FALLBACK ---------------- */}
            <Stack.Screen name="NotFound" component={NotFound} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}