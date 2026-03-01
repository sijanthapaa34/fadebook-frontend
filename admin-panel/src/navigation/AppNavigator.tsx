// src/AppNavigator.tsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Pages
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Placeholder from '@/pages/Placeholder';

// --- Lazy Loaded Pages ---

// Main Admin
const MainAdminDashboard = React.lazy(() => import('@/pages/admin/MainAdminDashboard'));
const ShopManagement = React.lazy(() => import('@/pages/admin/ShopManagement'));
const Applications = React.lazy(() => import('@/pages/admin/Application'));

// Shop Admin
const ShopAdminDashboard = React.lazy(() => import('@/pages/shopAdmin/ShopAdminDashboard'));
const BarberManagement = React.lazy(() => import('@/pages/shopAdmin/BarberManagement'));
const ServiceManagement = React.lazy(() => import('@/pages/shopAdmin/ServiceManagement'));
const LeaveApproval = React.lazy(() => import('@/pages/shopAdmin/LeaveApproval'));
const ChatDashboard = React.lazy(() => import('@/pages/shopAdmin/ChatDashboard'));

// --- Protected Route Component ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Loader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const AppNavigator = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <BrowserRouter>
      <Routes>
        {/* --- ROOT REDIRECT --- */}
        <Route 
          path="/" 
          element={
            user 
              ? <Navigate to={`/${user.role === 'MAIN_ADMIN' ? 'admin' : 'shop-admin'}/dashboard`} replace />
              : <Navigate to="/login" replace />
          } 
        />

        {/* --- PUBLIC ROUTES --- */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={user ? <Navigate to={`/${user.role === 'MAIN_ADMIN' ? 'admin' : 'shop-admin'}/dashboard`}/> : <Login />} />
          <Route path="/register" element={<Placeholder title="Register" />} />
        </Route>

        {/* --- MAIN ADMIN ROUTES --- */}
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
          <Route path="applications" element={<Suspense fallback={<Loader />}><Applications /></Suspense>} />
          
          {/* Placeholders for remaining Main Admin features */}
          <Route path="analytics" element={<Placeholder title="Analytics" />} />
          <Route path="commission" element={<Placeholder title="Commission Settings" />} />
        </Route>

        {/* --- SHOP ADMIN ROUTES --- */}
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
          
          {/* New Pages Added Here */}
          <Route path="barbers" element={<Suspense fallback={<Loader />}><BarberManagement /></Suspense>} />
          <Route path="services" element={<Suspense fallback={<Loader />}><ServiceManagement /></Suspense>} />
          <Route path="leave" element={<Suspense fallback={<Loader />}><LeaveApproval /></Suspense>} />
          <Route path="chat" element={<Suspense fallback={<Loader />}><ChatDashboard /></Suspense>} />

          {/* Placeholders for remaining Shop Admin features */}
          <Route path="appointments" element={<Placeholder title="Appointments" />} />
          <Route path="customers" element={<Placeholder title="Customers" />} />
        </Route>

        {/* --- 404 --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppNavigator;