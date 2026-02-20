// src/screens/NotFoundScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
// FIX: Import SafeAreaView from 'react-native-safe-area-context' to remove the warning
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Home, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';

const NotFoundScreen = () => {
  const navigation = useNavigation();

  const goHome = () => {
    // Assuming 'Landing' or 'CustomerDashboard' is your home
    // You might want to use the reset helper from NavigationService if you have auth logic
    navigation.navigate('Landing' as never);
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Search size={48} color={theme.colors.muted} />
        </View>

        {/* 404 Text */}
        <Text style={styles.errorCode}>404</Text>
        
        {/* Title */}
        <Text style={styles.title}>Page Not Found</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={goHome}>
            <Home size={18} color={theme.colors.text} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Go Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={goBack}>
            <ArrowLeft size={18} color={theme.colors.text} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
    opacity: 0.8,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: '700',
    fontFamily: theme.fonts.serif,
    color: theme.colors.primary, // Blue/Gold accent
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: theme.fonts.sans,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border,
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NotFoundScreen;