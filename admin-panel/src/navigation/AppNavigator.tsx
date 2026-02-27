// src/AppNavigator.tsx
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Pages
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

import Placeholder from '@/pages/Placeholder'; // The new placeholder

// Lazy Load Main Pages (Good for performance)
const MainAdminDashboard = React.lazy(() => import('@/pages/admin/MainAdminDashboard'));
const ShopAdminDashboard = React.lazy(() => import('@/pages/shopAdmin/ShopAdminDashboard'));

// --- Protected Route Component ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Loading Fallback
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
        {/* --- Public Routes --- */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={user ? <Navigate to={`/${user.role === 'MAIN_ADMIN' ? 'admin' : 'shop-admin'}/dashboard`}/> : <Login />} />
          <Route path="/register" element={<Placeholder title="Register" />} />
        </Route>

        {/* --- Main Admin Routes --- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={
            <Suspense fallback={<Loader />}><MainAdminDashboard /></Suspense>
          } />
          
          {/* Added missing Main Admin routes */}
          <Route path="shops" element={<Placeholder title="Shops Management" />} />
          <Route path="applications" element={<Placeholder title="Applications" />} />
          <Route path="analytics" element={<Placeholder title="Analytics" />} />
          <Route path="commission" element={<Placeholder title="Commission Settings" />} />
        </Route>

        {/* --- Shop Admin Routes --- */}
        <Route
          path="/shop-admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={
            <Suspense fallback={<Loader />}><ShopAdminDashboard /></Suspense>
          } />

          {/* Added missing Shop Admin routes */}
          <Route path="barbers" element={<Placeholder title="Barbers Management" />} />
          <Route path="services" element={<Placeholder title="Services Management" />} />
          <Route path="leave" element={<Placeholder title="Leave Requests" />} />
          <Route path="appointments" element={<Placeholder title="Appointments" />} />
          <Route path="customers" element={<Placeholder title="Customers" />} />
          <Route path="chat" element={<Placeholder title="Messages" />} />
        </Route>

        {/* --- Fallback --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppNavigator;