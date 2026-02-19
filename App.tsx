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

// --- ADD THIS IMPORT ---
import { configureGoogleSignin } from './src/api/authService';

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
// --- ADD THIS IMPORT ---
import BookAppointment from './src/screens/customer/BookAppointmentScreen';
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

  const initialize = useAuthStore((s) => s.initialize);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    initialize();
    
    // --- ADD THIS LINE ---
    // Configure Google Sign-In immediately when app starts
    configureGoogleSignin();
    
  }, [initialize]);

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
                
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                
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
                
                {/* Added BookAppointment Screen */}
                {/* We keep it outside DashboardLayout so it appears as a full screen stack */}
                <Stack.Screen name="BookAppointment" component={BookAppointment} />
              </>
            )}

            {/* ---------------- FALLBACK ---------------- */}
            <Stack.Screen name="NotFound" component={NotFound} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}