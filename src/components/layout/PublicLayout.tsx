// PublicLayout.tsx
// React Native version of Public Layout for unauthenticated screens

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import Logo from '../../components/Logo';
import type { RootStackParamList } from '../../navigation/NavigationService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface PublicLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, showNav = true }) => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const isLanding = route.name === 'Landing' || route.name === 'Home';

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleAbout = () => {
    navigation.navigate('About');
  };

  const handleContact = () => {
    navigation.navigate('Contact');
  };

  const handleHome = () => {
    navigation.navigate('Landing');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isLanding ? 'transparent' : theme.colors.background}
        translucent={isLanding}
      />

      {/* Header */}
      <View style={[styles.header, isLanding && styles.headerTransparent]}>
        <TouchableOpacity onPress={handleHome} activeOpacity={0.7}>
          <Logo size="sm" />
        </TouchableOpacity>

        {showNav && (
          <>
            {/* Desktop/Tablet Navigation */}
            {isTablet && (
              <View style={styles.desktopNav}>
                <TouchableOpacity onPress={handleHome} activeOpacity={0.7}>
                  <Text style={styles.navLink}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAbout} activeOpacity={0.7}>
                  <Text style={styles.navLink}>About</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleContact} activeOpacity={0.7}>
                  <Text style={styles.navLink}>Contact</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Auth Buttons */}
            <View style={styles.authButtons}>
              <TouchableOpacity style={styles.signInButton} onPress={handleLogin} activeOpacity={0.7}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.getStartedButton} onPress={handleRegister} activeOpacity={0.8}>
                <Text style={styles.getStartedText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    minHeight: 56,
    zIndex: 50,
  },
  headerTransparent: {
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
    borderBottomWidth: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  desktopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  navLink: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  signInButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: 'transparent',
  },
  signInText: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    fontWeight: '500',
    color: theme.colors.text,
  },
  getStartedButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  getStartedText: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    color: theme.colors.primaryText,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default PublicLayout;