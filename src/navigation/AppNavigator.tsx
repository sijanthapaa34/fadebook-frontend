// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

// Auth store
import { useAuthStore } from '../store/authStore';

// Public Screens
import Landing from '../screens/LandingScreen';
import Login from '../screens/LoginScreen';
import Register from '../screens/RegisterScreen';
import About from '../screens/AboutScreen';
import Contact from '../screens/ContactScreen';

// Private Screens
import CustomerDashboard from '../screens/customer/CustomerDashboardScreen';
import BookAppointment from '../screens/customer/BookAppointmentScreen';
import CustomerAppointments from '../screens/customer/MyAppointmentsScreen'; 

// Other Screens
import NotFound from '../screens/NotFoundScreen';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout';
import PublicLayout from '../components/layout/PublicLayout';

// Config
import { configureGoogleSignin } from '../api/authService';
import { theme } from '../theme/theme';

// ---------------- TYPES ----------------
export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  About: undefined;
  Contact: undefined;
  CustomerDashboard: undefined;
  BookAppointment: { shopId: string; shopName?: string };
  CustomerAppointments: undefined;
  NotFound: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ---------------- NAVIGATOR ----------------

const AppNavigator = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialize = useAuthStore((state) => state.initialize);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    configureGoogleSignin();
    initialize(); // <--- CRITICAL: Check if user is logged in on app start
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // 🔓 PUBLIC STACK
          <>
            <Stack.Screen name="Landing">
              {() => <PublicLayout><Landing /></PublicLayout>}
            </Stack.Screen>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="About">
              {() => <PublicLayout><About /></PublicLayout>}
            </Stack.Screen>
            <Stack.Screen name="Contact">
               {() => <PublicLayout><Contact /></PublicLayout>}
            </Stack.Screen>
          </>
        ) : (
          // 🔐 PRIVATE STACK
          <>
            <Stack.Screen name="CustomerDashboard">
              {() => (
                <DashboardLayout user={user} onLogout={logout}>
                  <CustomerDashboard />
                </DashboardLayout>
              )}
            </Stack.Screen>
            <Stack.Screen name="CustomerAppointments">
              {() => (
                <DashboardLayout user={user} onLogout={logout}>
                  <CustomerAppointments />
                </DashboardLayout>
              )}
            </Stack.Screen>
            <Stack.Screen name="BookAppointment" component={BookAppointment} />
          </>
        )}
        <Stack.Screen name="NotFound" component={NotFound} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;