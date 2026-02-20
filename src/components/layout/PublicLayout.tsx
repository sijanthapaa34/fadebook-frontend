// src/components/layout/PublicLayout.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import Logo from '../../components/Logo';
import type { RootStackParamList } from '../../navigation/AppNavigator';

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
  const insets = useSafeAreaInsets();

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
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isLanding ? 'transparent' : theme.colors.background}
        translucent={isLanding}
      />

      {/* Header */}
      <View
        style={[
          // Removed styles.header as styles are handled by headerSolid/headerTransparent
          isLanding ? styles.headerTransparent : styles.headerSolid,
          { paddingTop: insets.top },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleHome} activeOpacity={0.7} style={styles.logoContainer}>
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
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Solid Header for About, Contact, etc.
  headerSolid: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  // Transparent Header for Landing
  headerTransparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    borderBottomWidth: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: theme.spacing.lg,
  },
  logoContainer: {
    flexShrink: 1,
  },
  desktopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xl,
    marginHorizontal: theme.spacing.xl,
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
    flexShrink: 0,
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
  mainContent: {
    flex: 1,
  },
});

export default PublicLayout;