/**
 * Navigation Service
 * Central navigation management for React Native
 * @path: ./navigation/NavigationService.ts
 */

import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

// Define your navigation param list type
export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  Shops: undefined;
  ShopDetail: { shopId: string };
  About: undefined;
  Contact: undefined;
  ForgotPassword: undefined;
  NotFound: undefined;
  
  // Customer Routes
  CustomerDashboard: undefined;
  BookAppointment: { shopId?: string };
  CustomerBook: undefined;
  CustomerAppointments: undefined;
  CustomerLoyalty: undefined;
  
  // Barber Routes
  BarberDashboard: undefined;
  
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen
 * @param name - Screen name from RootStackParamList
 * @param params - Optional parameters to pass
 */
export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as any)(name, params);
  }
}

/**
 * Reset navigation stack to a specific screen
 * @param name - Screen name to reset to
 * @param params - Optional parameters to pass
 */
export function reset<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name, params }],
    });
  }
}

/**
 * Push a new screen onto the stack
 * @param name - Screen name
 * @param params - Optional parameters
 */
export function push<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  }
}

/**
 * Go back to previous screen
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * Replace current screen with a new one
 * @param name - Screen name to replace with
 * @param params - Optional parameters
 */
export function replace<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
}

/**
 * Pop to the top of the stack
 */
export function popToTop() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.popToTop());
  }
}

/**
 * Get current route name
 */
export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return undefined;
}

export type UserRole = 'CUSTOMER' | 'BARBER';

const roleRedirects = {
  CUSTOMER: 'CustomerDashboard',
  BARBER: 'BarberDashboard',
} as const;

export function redirectByRole(role: UserRole) {
  replace(roleRedirects[role]);
}
