// /**
//  * Barber Reservation App
//  * @format
//  */

// import React, { useEffect } from 'react';
// import { StatusBar, useColorScheme } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import { navigationRef, RootStackParamList } from './navigation/NavigationService';
// import { useAuthStore } from './store/authStore';

// // Screens
// import Login from './screens/LoginScreen';
// import Register from './screens/RegisterScreen';
// import Shops from './screens/ShopsScreen';
// import About from './screens/AboutScreen';
// import Contact from './screens/ContactScreen';
// import CustomerDashboard from './screens/customer/CustomerDashboardScreen';
// import BookAppointment from './screens/customer/BookAppointmentScreen';
// import BarberDashboard from './screens/barber/BarberDashboardScreen';
// import NotFound from './screens/NotFoundScreen';
// import Landing from './screens/LandingScreen';

// // Configure Google Sign-In (do this once when app starts)
// GoogleSignin.configure({
//   offlineAccess: false,
// });

// // Create QueryClient
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 2,
//       staleTime: 5 * 60 * 1000, // 5 minutes
//     },
//   },
// });

// const Stack = createNativeStackNavigator<RootStackParamList>();

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';
//   const initialize = useAuthStore((state) => state.initialize);
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   const user = useAuthStore((state) => state.user);

//   useEffect(() => {
//     initialize();
//   }, [initialize]);

//   // Helper function to check if user has required role
//   const hasRole = (roles: string[]): boolean => {
//     return !!(isAuthenticated && user && roles.includes(user.role));
//   };

//   return (
//     <QueryClientProvider client={queryClient}>
//       <SafeAreaProvider>
//         <NavigationContainer ref={navigationRef}>
//           <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//           <Stack.Navigator
//             initialRouteName="Landing"
//             screenOptions={{
//               headerShown: false,
//               contentStyle: { backgroundColor: '#0A0A0A' },
//             }}
//           >
//             {/* Public Routes */}
//             <Stack.Screen name="Landing" component={Landing} />
//             <Stack.Screen name="Login" component={Login} />
//             <Stack.Screen name="Register" component={Register} />
//             <Stack.Screen name="Shops" component={Shops} />
//             <Stack.Screen name="About" component={About} />
//             <Stack.Screen name="Contact" component={Contact} />
            
//             {/* Customer Routes */}
//             <Stack.Screen 
//               name="CustomerDashboard" 
//               component={CustomerDashboard}
//               options={{
//                 gestureEnabled: hasRole(['customer']),
//               }}
//             />
//             <Stack.Screen 
//               name="BookAppointment" 
//               component={BookAppointment}
//               options={{
//                 gestureEnabled: hasRole(['customer']),
//               }}
//             />
            
//             {/* Barber Routes */}
//             <Stack.Screen 
//               name="BarberDashboard" 
//               component={BarberDashboard}
//               options={{
//                 gestureEnabled: hasRole(['barber']),
//               }}
//             />
//             {/* 404 Not Found */}
//             <Stack.Screen 
//               name="NotFound" 
//               component={NotFound}
//             />
//           </Stack.Navigator>
//         </NavigationContainer>
//       </SafeAreaProvider>
//     </QueryClientProvider>
//   );
// }

// export default App;