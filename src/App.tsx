/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { Toaster } from './components/ui/sonner';
import Layout from './components/layout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminServices from './pages/admin/AdminServices';
import AdminApplications from './pages/admin/AdminApplications';
import AdminReports from './pages/admin/AdminReports';
import UserServices from './pages/user/UserServices';
import ApplyService from './pages/user/ApplyService';
import UserApplications from './pages/user/UserApplications';
import ApplicationDetail from './pages/user/ApplicationDetail';

// Guards
function RequireAuth({ children, role }: { children: React.ReactNode, role?: 'admin' | 'user' }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<RequireAuth role="admin"><Outlet /></RequireAuth>}>
               <Route index element={<Navigate to="services" replace />} />
               <Route path="services" element={<AdminServices />} />
               <Route path="applications" element={<AdminApplications />} />
               <Route path="reports" element={<AdminReports />} />
            </Route>

            {/* User Routes */}
            <Route path="/user" element={<RequireAuth role="user"><Outlet /></RequireAuth>}>
               <Route index element={<Navigate to="services" replace />} />
               <Route path="services" element={<UserServices />} />
               <Route path="apply/:id" element={<ApplyService />} />
               <Route path="applications" element={<UserApplications />} />
               <Route path="applications/:id" element={<ApplicationDetail />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}


