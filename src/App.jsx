import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Events from './pages/Events';
import Users from './pages/Users';
import Profile from './pages/Profile';
import './App.css';

const LayoutWrapper = ({ children, title }) => {
  return (
    <DashboardLayout title={title}>
      {children}
    </DashboardLayout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute allowedRoles={['admin', 'user']} />}>
              <Route path="/events" element={<LayoutWrapper title="Event Management"><Events /></LayoutWrapper>} />
              <Route path="/profile" element={<LayoutWrapper title="My Profile"><Profile /></LayoutWrapper>} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<LayoutWrapper title="Dashboard Overview"><Dashboard /></LayoutWrapper>} />
              <Route path="/payments" element={<LayoutWrapper title="Payment Management"><Payments /></LayoutWrapper>} />
              <Route path="/users" element={<LayoutWrapper title="User Management"><Users /></LayoutWrapper>} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
