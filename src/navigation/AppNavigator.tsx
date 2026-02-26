// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

// Auth store
import { useAuthStore } from '../store/authStore';

// Public Screens
import Landing from '../screens/LandingScreen';
import Login from '../screens/LoginScreen';
import Register from '../screens/RegisterScreen';
import About from '../screens/AboutScreen';
import Contact from '../screens/ContactScreen';
import Apply from '../screens/ApplyScreen';

// Private Screens - Customer
import CustomerDashboard from '../screens/customer/CustomerDashboardScreen';
import ShopDetail from '../screens/customer/ShopDetailScreen';
import ServiceDetail from '../screens/customer/ServiceDetailScreen';
import BarberDetail from '../screens/customer/BarberDetailScreen';
import BookAppointment from '../screens/customer/BookAppointmentScreen';
import CustomerAppointments from '../screens/customer/CustomerAppointmentsScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import CustomerPayments from '../screens/customer/CustomerPaymentsScreen';
import CustomerChatScreen from '../screens/customer/CustomerChatScreen';
import CustomerProfileScreen from '../screens/customer/CustomerProfileScreen';

// Private Screens - Barber
import BarberDashboard from '../screens/barber/BarberDashboardScreen';
import BarberSchedule from '../screens/barber/BarberScheduleScreen';
import BarberLeave from '../screens/barber/BarberLeaveScreen';
import BarberReview from '../screens/barber/BarberReviewScreen';

import NotFound from '../screens/NotFoundScreen';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout';
import PublicLayout from '../components/layout/PublicLayout';

// Config
import { configureGoogleSignin } from '../api/authService';
import { theme } from '../theme/theme';

// Types
import type { RescheduleData } from '../models/models';
import BarberProfileScreen from '../screens/barber/BarberProfileScreen';

// ---------------- PLACEHOLDER ----------------
const PlaceholderScreen = ({ route }: any) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{route.name} (Coming Soon)</Text>
  </View>
);

// ---------------- TYPES ----------------
export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  About: undefined;
  Contact: undefined;
  Apply: { type: 'barber' | 'shop' };
  
  // Customer Routes
  CustomerDashboard: undefined;
  ShopDetail: { shopId: number };
  ServiceDetail: { serviceId: number };
  BarberDetail: { barberId: number };
  BookAppointment: { shopId: number; shopName?: string; reschedule?: RescheduleData };
  CustomerAppointments: undefined;
  CustomerPayments: undefined;
  CustomerChat: undefined; 
  CustomerProfile: undefined;
  Checkout: {
    amount: number;
    shopName: string;
    serviceName: string;
    barberName: string;
    date: string;
    time: string;
    barberId: number;
    barbershopId: number;
    serviceIds: number[];
    scheduledTime: string;
  };

  // Barber Routes
  BarberDashboard: undefined;
  BarberSchedule: undefined;
  BarberLeave: undefined; 
  BarberReview: undefined; 
  BarberEarnings: undefined;
  BarberProfile: undefined;

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
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* 🔓 PUBLIC STACK */}
        {!user ? (
          <Stack.Group>
            <Stack.Screen name="Landing">
              {() => <PublicLayout><Landing /></PublicLayout>}
            </Stack.Screen>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Apply" component={Apply} />
            <Stack.Screen name="About">
              {() => <PublicLayout><About /></PublicLayout>}
            </Stack.Screen>
            <Stack.Screen name="Contact">
               {() => <PublicLayout><Contact /></PublicLayout>}
            </Stack.Screen>
          </Stack.Group>
        ) : (
          /* 🔐 PRIVATE STACK (Role Based) */
          <Stack.Group>
            
            {/* ✂️ BARBER FLOW */}
            {user.role === 'BARBER' && (
              <>
                <Stack.Screen name="BarberDashboard">
                  {() => (
                    <DashboardLayout user={user} onLogout={logout}>
                      <BarberDashboard />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
                <Stack.Screen name="BarberSchedule">
                  {() => (
                    <DashboardLayout user={user} onLogout={logout}>
                      <BarberSchedule />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
                <Stack.Screen name="BarberLeave">
                  {() => (
                    <DashboardLayout user={user} onLogout={logout}>
                      <BarberLeave />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
                <Stack.Screen name="BarberReview">
                  {() => (
                    <DashboardLayout user={user} onLogout={logout}>
                      <BarberReview />
                    </DashboardLayout>
                  )}
                </Stack.Screen><Stack.Screen name="BarberProfile">
                  {() => (
                    <DashboardLayout user={user} onLogout={logout}>
                      <BarberProfileScreen />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
                <Stack.Screen name="BarberEarnings" component={PlaceholderScreen} />
              </>
            )}

            {/* 👤 CUSTOMER FLOW (Default) */}
            {user.role !== 'BARBER' && (
              <>
                <Stack.Screen name="CustomerDashboard">
                  {() => (
                    <DashboardLayout user={user} onLogout={logout}>
                      <CustomerDashboard />
                    </DashboardLayout>
                  )}
                </Stack.Screen>

                {/* Detail Screens */}
                <Stack.Screen name="ShopDetail" component={ShopDetail} />
                <Stack.Screen name="ServiceDetail" component={ServiceDetail} />
                <Stack.Screen name="BarberDetail" component={BarberDetail} />
                <Stack.Screen name="BookAppointment" component={BookAppointment} />
                <Stack.Screen name="Checkout" component={CheckoutScreen} />

                {/* Tabs wrapped in Layout */}
                <Stack.Screen name="CustomerAppointments">
                  {() => (
                    <DashboardLayout user={user} onLogout={logout}>
                      <CustomerAppointments />
                    </DashboardLayout>
                  )}
                </Stack.Screen>

                <Stack.Screen name="CustomerPayments">
                  {() => (
                    <DashboardLayout user={user} onLogout={logout}>
                      <CustomerPayments />
                    </DashboardLayout>
                  )}
                </Stack.Screen>

                <Stack.Screen name="CustomerChat">
                  {() => (
                    <DashboardLayout user={user} onLogout={logout}>
                      <CustomerChatScreen />
                    </DashboardLayout>
                  )}
                </Stack.Screen>

                <Stack.Screen name="CustomerProfile">
                  {() => (
                    <DashboardLayout user={user} onLogout={logout}>
                      <CustomerProfileScreen />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
              </>
            )}
          </Stack.Group>
        )}
        
        <Stack.Screen name="NotFound" component={NotFound} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: theme.colors.background
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  placeholderText: {
    color: theme.colors.muted,
    fontSize: 16,
    fontFamily: theme.fonts.sans,
  }
});

export default AppNavigator;