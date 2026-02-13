/**
 * Header Component
 * Main navigation header for the app
 * @path: ./components/Header.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Scissors, LogOut, User, Menu, X } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { navigate } from '../../navigation/NavigationService';

export const Header = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const navigation = useNavigation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('Login');
  };

  const getDashboardPath = () => {
    if (!user) return 'Landing';
    switch (user.role) {
      case 'CUSTOMER':
        return 'CustomerDashboard';
      case 'BARBER':
        return 'BarberDashboard';
      default:
        return 'Landing';
    }
  };

  const handleNavigate = (screen: string) => {
    setShowMobileMenu(false);
    navigate(screen as any);
  };

  const handleDashboard = () => {
    setShowUserMenu(false);
    navigate(getDashboardPath() as any);
  };

  return (
    <>
      <View style={styles.header}>
        {/* Logo */}
        <TouchableOpacity
          style={styles.logo}
          onPress={() => navigate('Landing')}
          activeOpacity={0.7}
        >
          <Scissors size={24} color="#d4af37" />
          <Text style={styles.logoText}>BarberBook</Text>
        </TouchableOpacity>

        {/* Desktop Navigation */}
        <View style={styles.desktopNav}>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => navigate('Shops')}
            activeOpacity={0.7}
          >
            <Text style={styles.navLinkText}>Find Shops</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => navigate('About')}
            activeOpacity={0.7}
          >
            <Text style={styles.navLinkText}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => navigate('Contact')}
            activeOpacity={0.7}
          >
            <Text style={styles.navLinkText}>Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {isAuthenticated ? (
            <>
              <TouchableOpacity
                style={styles.userButton}
                onPress={() => setShowUserMenu(true)}
                activeOpacity={0.7}
              >
                <User size={20} color="#fff" />
              </TouchableOpacity>

              {/* Mobile Menu Button */}
              <TouchableOpacity
                style={[styles.menuButton, styles.mobileOnly]}
                onPress={() => setShowMobileMenu(true)}
                activeOpacity={0.7}
              >
                <Menu size={20} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.signupButton}
                onPress={() => navigate('Register')}
                activeOpacity={0.8}
              >
                <Text style={styles.signupButtonText}>Sign Up</Text>
              </TouchableOpacity>

              {/* Mobile Menu Button for non-authenticated */}
              <TouchableOpacity
                style={[styles.menuButton, styles.mobileOnly]}
                onPress={() => setShowMobileMenu(true)}
                activeOpacity={0.7}
              >
                <Menu size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* User Dropdown Menu */}
      <Modal
        visible={showUserMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowUserMenu(false)}>
          <View style={styles.userMenuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDashboard}
              activeOpacity={0.7}
            >
              <User size={16} color="#fff" />
              <Text style={styles.menuItemText}>Dashboard</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogOut size={16} color="#ef4444" />
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Mobile Navigation Menu */}
      <Modal
        visible={showMobileMenu}
        animationType="slide"
        onRequestClose={() => setShowMobileMenu(false)}
      >
        <View style={styles.mobileMenuContainer}>
          <View style={styles.mobileMenuHeader}>
            <TouchableOpacity
              style={styles.logo}
              onPress={() => {
                setShowMobileMenu(false);
                navigate('Landing');
              }}
              activeOpacity={0.7}
            >
              <Scissors size={24} color="#d4af37" />
              <Text style={styles.logoText}>BarberBook</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowMobileMenu(false)}
              activeOpacity={0.7}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.mobileMenuContent}>
            <TouchableOpacity
              style={styles.mobileMenuItem}
              onPress={() => handleNavigate('Shops')}
              activeOpacity={0.7}
            >
              <Text style={styles.mobileMenuItemText}>Find Shops</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mobileMenuItem}
              onPress={() => handleNavigate('About')}
              activeOpacity={0.7}
            >
              <Text style={styles.mobileMenuItemText}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mobileMenuItem}
              onPress={() => handleNavigate('Contact')}
              activeOpacity={0.7}
            >
              <Text style={styles.mobileMenuItemText}>Contact</Text>
            </TouchableOpacity>

            {isAuthenticated && (
              <>
                <View style={styles.mobileDivider} />
                <TouchableOpacity
                  style={styles.mobileMenuItem}
                  onPress={() => {
                    setShowMobileMenu(false);
                    handleDashboard();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.mobileMenuItemText}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.mobileMenuItem}
                  onPress={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.mobileMenuItemText, styles.logoutText]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        paddingTop: StatusBar.currentHeight || 0,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  desktopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    display: 'none', // Hide on mobile, would need MediaQuery for web
  },
  navLink: {
    paddingVertical: 8,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  signupButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  signupButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileOnly: {
    // Would be controlled by media queries on web
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingRight: 16,
  },
  userMenuContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    minWidth: 192,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutText: {
    color: '#ef4444',
  },
  mobileMenuContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  mobileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  mobileMenuContent: {
    flex: 1,
    paddingTop: 24,
  },
  mobileMenuItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  mobileMenuItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  mobileDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
    marginHorizontal: 24,
  },
});