import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Placeholder from '@/pages/Placeholder';
import Settings from '@/pages/Settings';
import ManageShop from '@/pages/shopAdmin/ManageShop';

// Lazy Loaded Pages
const MainAdminDashboard = React.lazy(() => import('@/pages/admin/MainAdminDashboard'));
const ShopManagement = React.lazy(() => import('@/pages/admin/ShopManagement'));
const AdminApplications = React.lazy(() => import('@/pages/admin/Application'));
const ShopDetail = React.lazy(() => import('@/pages/admin/ShopDetail'));
const BarberDetail = React.lazy(() => import('@/pages/admin/BarberDetail'));
const ServiceDetail = React.lazy(() => import('@/pages/admin/ServiceDetail'));
const ShopAdminDashboard = React.lazy(() => import('@/pages/shopAdmin/ShopAdminDashboard'));
const BarberManagement = React.lazy(() => import('@/pages/shopAdmin/BarberManagement'));
const ServiceManagement = React.lazy(() => import('@/pages/shopAdmin/ServiceManagement'));
const ShopAdminApplications = React.lazy(() => import('@/pages/shopAdmin/Applications'));
const LeaveApproval = React.lazy(() => import('@/pages/shopAdmin/LeaveApproval'));
const ChatDashboard = React.lazy(() => import('@/pages/shopAdmin/ChatDashboard'));

const Loader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppNavigator = () => {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initialize = useAuthStore((state) => state.initialize);
  
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (!isInitialized) {
        await initialize();
      }
      setReady(true);
    };
    initAuth();
  }, [isInitialized, initialize]);

  if (!ready) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            user 
              ? <Navigate to={`/${user.role === 'MAIN_ADMIN' ? 'admin' : 'shop-admin'}/dashboard`} replace />
              : <Navigate to="/login" replace />
          } 
        />

        <Route element={<PublicLayout />}>
          <Route path="/login" element={user ? <Navigate to={`/${user.role === 'MAIN_ADMIN' ? 'admin' : 'shop-admin'}/dashboard`}/> : <Login />} />
          <Route path="/register" element={<Placeholder title="Register" />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Suspense fallback={<Loader />}><MainAdminDashboard /></Suspense>} />
          <Route path="shops" element={<Suspense fallback={<Loader />}><ShopManagement /></Suspense>} />
          <Route path="shops/:shopId" element={<Suspense fallback={<Loader />}><ShopDetail /></Suspense>} />
          <Route path="applications" element={<Suspense fallback={<Loader />}><AdminApplications /></Suspense>} />
          <Route path="barbers/:barberId" element={<Suspense fallback={<Loader />}><BarberDetail /></Suspense>} />
          <Route path="services/:serviceId" element={<Suspense fallback={<Loader />}><ServiceDetail /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<Loader />}><Settings /></Suspense>} />
          <Route path="analytics" element={<Placeholder title="Analytics" />} />
          <Route path="commission" element={<Placeholder title="Commission Settings" />} />
        </Route>

        <Route
          path="/shop-admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Suspense fallback={<Loader />}><ShopAdminDashboard /></Suspense>} />
          <Route path="manage-shop" element={<Suspense fallback={<Loader />}><ManageShop /></Suspense>} />
          <Route path="barbers" element={<Suspense fallback={<Loader />}><BarberManagement /></Suspense>} />
          <Route path="services" element={<Suspense fallback={<Loader />}><ServiceManagement /></Suspense>} />
          <Route path="applications" element={<Suspense fallback={<Loader />}><ShopAdminApplications /></Suspense>} />
          <Route path="leave" element={<Suspense fallback={<Loader />}><LeaveApproval /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<Loader />}><Settings /></Suspense>} />
          <Route path="chat" element={<Suspense fallback={<Loader />}><ChatDashboard /></Suspense>} />
          <Route path="appointments" element={<Placeholder title="Appointments" />} />
          <Route path="customers" element={<Placeholder title="Customers" />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppNavigator;