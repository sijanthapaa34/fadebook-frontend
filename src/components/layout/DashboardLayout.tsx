// DashboardLayout.tsx
// React Native version of Dashboard Layout with mobile navigation

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  Users,
  Settings,
  LogOut,
  Scissors,
  Store,
  BarChart3,
  Sliders,
  UserCircle,
  MessageSquare,
  MapPin,
  CreditCard,
} from 'lucide-react-native';
import { theme } from '../../theme/theme';
import Logo from '../../components/Logo';
import type { RootStackParamList } from '../../navigation/NavigationService';
import type { UserRole } from '../../models/models';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Icon component type
type IconComponentType = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

interface NavItem {
  label: string;
  path: string;
  Icon: IconComponentType;
}

const navConfig: Record<UserRole, NavItem[]> = {
  CUSTOMER: [
    { label: 'Find Shops', path: 'CustomerShops', Icon: MapPin },
    { label: 'My Bookings', path: 'CustomerAppointments', Icon: Calendar },
    { label: 'Payments', path: 'CustomerPayments', Icon: CreditCard },
    { label: 'Chat', path: 'CustomerChat', Icon: MessageSquare },
    { label: 'Profile', path: 'CustomerProfile', Icon: UserCircle },
  ],
  BARBER: [
    { label: 'Dashboard', path: 'BarberDashboard', Icon: LayoutDashboard },
    { label: 'Schedule', path: 'BarberSchedule', Icon: Calendar },
    { label: 'Earnings', path: 'BarberEarnings', Icon: DollarSign },
    { label: 'Profile', path: 'BarberProfile', Icon: UserCircle },
  ],
  
};

interface DashboardLayoutProps {
  user: {
    name: string;
    role: UserRole;
  };
  children: React.ReactNode;
  onLogout: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, children, onLogout }) => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const navItems = navConfig[user.role];

  const currentPath = route.name;

  const handleNavigation = (path: string) => {
    navigation.navigate(path as any);
  };

  // Render icon with proper typing
  const renderIcon = (Icon: IconComponentType, isActive: boolean, size: number = 18) => {
    const color = isActive ? theme.colors.primary : theme.colors.muted;
    return <Icon size={size} color={color} strokeWidth={2} />;
  };

  // Tablet Layout with Sidebar
  if (isTablet) {
    return (
      <View style={styles.tabletContainer}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Logo size="sm" />
          </View>

          <ScrollView style={styles.sidebarNav} showsVerticalScrollIndicator={false}>
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <TouchableOpacity
                  key={item.path}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => handleNavigation(item.path)}
                  activeOpacity={0.7}
                >
                  {renderIcon(item.Icon, isActive)}
                  <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.sidebarFooter}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={styles.userRole}>{user.role.replace('_', ' ')}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
              <LogOut size={16} color={theme.colors.muted} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    );
  }

  // Mobile Layout with Bottom Tabs
  return (
    <View style={styles.mobileContainer}>
      {/* Header */}
      <View style={styles.mobileHeader}>
        <Logo size="sm" />
        <TouchableOpacity style={styles.headerLogout} onPress={onLogout} activeOpacity={0.7}>
          <LogOut size={18} color={theme.colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.mobileContent}
        contentContainerStyle={styles.mobileContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navItems.slice(0, 5).map((item) => {
          const isActive = currentPath === item.path;
          return (
            <TouchableOpacity
              key={item.path}
              style={styles.bottomNavItem}
              onPress={() => handleNavigation(item.path)}
              activeOpacity={0.7}
            >
              {renderIcon(item.Icon, isActive, 20)}
              <Text style={[styles.bottomNavText, isActive && styles.bottomNavTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Tablet Styles
  tabletContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
  },
  sidebar: {
    width: 256,
    backgroundColor: 'rgba(24, 24, 27, 0.4)',
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sidebarNav: {
    flex: 1,
    padding: theme.spacing.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xs,
  },
  navItemActive: {
    backgroundColor: `${theme.colors.primary}1A`,
  },
  navItemText: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
  },
  navItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  sidebarFooter: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    fontWeight: '500',
    color: theme.colors.text,
  },
  userRole: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    textTransform: 'capitalize',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: 'transparent',
  },
  logoutText: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
  },
  mainContent: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.xl,
  },

  // Mobile Styles
  mobileContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'rgba(24, 24, 27, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingTop: 48,
  },
  headerLogout: {
    padding: theme.spacing.sm,
  },
  mobileContent: {
    flex: 1,
  },
  mobileContentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.95)',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingBottom: 28,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  bottomNavText: {
    fontSize: 10,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  bottomNavTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default DashboardLayout;