import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    // Check authentication and role
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        // Redirect to login if not authenticated
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' as never }],
        });
      } else if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        switch (user.role) {
          case 'CUSTOMER':
            navigation.reset({
              index: 0,
              routes: [{ name: 'CustomerDashboard' as never }],
            });
            break;
          case 'BARBER':
            navigation.reset({
              index: 0,
              routes: [{ name: 'BarberDashboard' as never }],
            });
            break;
          default:
            navigation.reset({
              index: 0,
              routes: [{ name: 'Landing' as never }],
            });
        }
      }
    }
  }, [isAuthenticated, user, isLoading, allowedRoles, navigation]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show unauthorized if no auth or wrong role
  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unauthorized Access</Text>
        <Text style={styles.errorSubtext}>Redirecting...</Text>
      </View>
    );
  }

  // Render children if authorized
  return children;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});