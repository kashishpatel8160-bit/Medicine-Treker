import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MedicineProvider } from './contexts/MedicineContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import MedicineTracker from './pages/MedicineTracker';

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
            
            {/* Protected Medicine Tracker Route */}
            <Route 
              path="/dashboard/medicine-tracker" 
              element={
                <ProtectedRoute>
                  <MedicineTracker />
                </ProtectedRoute>
              } 
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
