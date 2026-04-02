// src/navigation/AppNavigator.tsx
import React, { useEffect, useRef } from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Auth store
import { useAuthStore } from '../store/authStore';

// Public Screens
import Landing from '../screens/LandingScreen';
import Login from '../screens/LoginScreen';
import Register from '../screens/RegisterScreen';
import OtpVerification from '../screens/OtpScreen';
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
import PaymentCallbackScreen from '../screens/customer/PaymentCallbackScreen';

// Private Screens - Barber
import BarberDashboard from '../screens/barber/BarberDashboardScreen';
import BarberSchedule from '../screens/barber/BarberScheduleScreen';
import BarberLeave from '../screens/barber/BarberLeaveScreen';
import BarberReview from '../screens/barber/BarberReviewScreen';
import BarberProfileScreen from '../screens/barber/BarberProfileScreen';

import NotFound from '../screens/NotFoundScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout';
import PublicLayout from '../components/layout/PublicLayout';

// Config
import { configureGoogleSignin } from '../api/authService';
import { theme } from '../theme/theme';

// ✅ NEW: Notification navigation ref setter
import { setNotificationNavigationRef } from '../api/pushNotificationService';

// Types
import type { RescheduleData } from '../models/models';

// ---------------- PLACEHOLDER ----------------
const PlaceholderScreen = ({ route }: any) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{route.name} (Coming Soon)</Text>
  </View>
);

// ---------------- LOADING SCREEN ----------------
const LoadingScreen = ({ onForceLogout }: { onForceLogout: () => void }) => {
  const [showLogout, setShowLogout] = React.useState(false);

  React.useEffect(() => {
    // Show force-logout button after 6 seconds if still loading
    const timer = setTimeout(() => setShowLogout(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {showLogout && (
        <TouchableOpacity
          style={styles.forceLogoutBtn}
          onPress={onForceLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.forceLogoutText}>Taking too long? Sign Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ---------------- TYPES ----------------
export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  OtpVerification: {
    mode: 'REGISTER' | 'APPLICATION';
    email: string;
    userData?: { name: string; email: string; password: string; phone: string };
    photoUri?: string | null;
    applicationData?: any;
    imageUris?: { profile?: string; license?: string; doc?: string; shopImages: string[] };
  };
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
    serviceName: string;
    barberName: string;
    shopName: string;
    date: string;
    time: string;
    barberId: number;
    barbershopId: number;
    serviceIds: number[];
    scheduledTime: string; 
  };
  
  PaymentCallback: {
    txId?: string;
    pidx?: string;
    refId?: string;
    status?: string; 
  };

  // Barber Routes
  BarberDashboard: undefined;
  BarberSchedule: undefined;
  BarberLeave: undefined; 
  BarberReview: undefined; 
  BarberEarnings: undefined;
  BarberProfile: undefined;

  Notifications: undefined;
  NotFound: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ---------------- DEEP LINKING CONFIGURATION ----------------
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['fadebook://'],
  
  config: {
    screens: {
      PaymentCallback: {
        path: 'payment-callback',
        parse: {
          txId: (txId: string) => txId,
          pidx: (pidx: string) => pidx,
          refId: (refId: string) => refId,
          status: (status: string) => status,
        },
      },
    },
  },
};

// ---------------- NAVIGATOR ----------------
const AppNavigator = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialize = useAuthStore((state) => state.initialize);
  const logout = useAuthStore((state) => state.logout);
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    configureGoogleSignin();
    initialize();
  }, []);

  // ✅ NEW: Set navigation ref for notification service whenever it changes
  useEffect(() => {
    if (navigationRef.current) {
      setNotificationNavigationRef(navigationRef.current);
    }
  }, [navigationRef.current]);

  if (isLoading) {
    return <LoadingScreen onForceLogout={logout} />;
  }

  return (
    <NavigationContainer 
      linking={linking} 
      ref={navigationRef}
      onReady={() => {
        // ✅ Set ref when container is ready
        if (navigationRef.current) {
          setNotificationNavigationRef(navigationRef.current);
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* 🔓 PUBLIC STACK */}
        {!user ? (
          <Stack.Group>
            <Stack.Screen name="Landing">
              {() => <PublicLayout><Landing /></PublicLayout>}
            </Stack.Screen>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="OtpVerification" component={OtpVerification} />
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
                </Stack.Screen>
                <Stack.Screen name="BarberProfile">
                  {() => (
                    <DashboardLayout user={user} onLogout={logout}>
                      <BarberProfileScreen />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
                <Stack.Screen name="BarberEarnings" component={PlaceholderScreen} />
                <Stack.Screen name="Notifications">
                  {() => (
                    <DashboardLayout user={user} onLogout={logout}>
                      <NotificationsScreen />
                    </DashboardLayout>
                  )}
                </Stack.Screen>
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
                
                <Stack.Screen 
                  name="Checkout" 
                  component={CheckoutScreen} 
                />

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

                <Stack.Screen name="Notifications">
                  {() => (
                    <DashboardLayout user={user} onLogout={logout}>
                      <NotificationsScreen />
                    </DashboardLayout>
                  )}
                </Stack.Screen>

                <Stack.Screen 
                  name="PaymentCallback" 
                  component={PaymentCallbackScreen} 
                  options={{ 
                    headerShown: false,
                    gestureEnabled: false,
                  }} 
                />
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
    backgroundColor: theme.colors.background,
    gap: 24,
  },
  forceLogoutBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  forceLogoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
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