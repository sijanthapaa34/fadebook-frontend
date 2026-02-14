// AppNavigator.tsx
// Centralized Navigation with Layouts

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import PublicLayout from './components/layout/PublicLayout';

// Screens
import CustomerDashboard from './screens/customer/CustomerDashboardScreen';
import Landing from './screens/LandingScreen';
import Login from './screens/LoginScreen';
import Register from './screens/RegisterScreen';
import About from './screens/AboutScreen';
import Contact from './screens/ContactScreen';

// Auth Store
import { useAuthStore } from './store/authStore';

// Types
import type { RootStackParamList } from './navigation/NavigationService';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user, logout } = useAuthStore();

  // Not authenticated - Public Screens
  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
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
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Authenticated - Dashboard Screens
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Customer Screens */}
        <Stack.Screen name="CustomerShops">
          {() => (
            <DashboardLayout user={user} onLogout={logout}>
              <CustomerDashboard />
            </DashboardLayout>
          )}
        </Stack.Screen>
        
        {/* <Stack.Screen name="CustomerAppointments">
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
              <CustomerChat />
            </DashboardLayout>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="CustomerProfile">
          {() => (
            <DashboardLayout user={user} onLogout={logout}>
              <CustomerProfile />
            </DashboardLayout>
          )}
        </Stack.Screen>

        {/* Barber Screens */}
        {/* <Stack.Screen name="BarberDashboard">
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
        
        <Stack.Screen name="BarberEarnings">
          {() => (
            <DashboardLayout user={user} onLogout={logout}>
              <BarberEarnings />
            </DashboardLayout>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="BarberProfile">
          {() => (
            <DashboardLayout user={user} onLogout={logout}>
              <BarberProfile />
            </DashboardLayout>
          )} 
        </Stack.Screen> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;