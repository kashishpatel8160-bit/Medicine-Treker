import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MedicineProvider } from './contexts/MedicineContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Medicines from './pages/Medicines';
import Reminders from './pages/Reminders';
import Prescriptions from './pages/Prescriptions';
import History from './pages/History';
import Settings from './pages/Settings';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MedicineProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected Dashboard Route */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Medicines Route */}
            <Route 
              path="/dashboard/medicines" 
              element={
                <ProtectedRoute>
                  <Medicines />
                </ProtectedRoute>
              } 
            />

            {/* Protected Reminders Route */}
            <Route 
              path="/dashboard/reminders" 
              element={
                <ProtectedRoute>
                  <Reminders />
                </ProtectedRoute>
              } 
            />

            {/* Protected Prescriptions Route */}
            <Route 
              path="/dashboard/prescriptions" 
              element={
                <ProtectedRoute>
                  <Prescriptions />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected History Route */}
            <Route 
              path="/dashboard/history" 
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } 
            />

            {/* Protected Settings Route */}
            <Route 
              path="/dashboard/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect old path */}
            <Route 
              path="/dashboard/medicine-tracker" 
              element={<Navigate to="/dashboard/medicines" replace />} 
            />
            
            {/* Catch-all route mapping to dashboard if authenticated, else handled by ProtectedRoute */}
            <Route 
              path="*" 
              element={<Navigate to="/dashboard" replace />} 
            />
          </Routes>
        </MedicineProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
