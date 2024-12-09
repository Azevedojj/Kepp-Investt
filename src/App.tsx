import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { InvestmentsPage } from './components/InvestmentsPage';
import { ExpensesPage } from './components/ExpensesPage';
import { InvestmentDetails } from './components/InvestmentDetails';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { useAuthStore } from './store/useAuthStore';
import { SettingsPage } from './components/SettingsPage';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserStatusMonitor } from './components/UserStatusMonitor';
import { AdminPage } from './components/AdminPage';
import { CreateAdmin } from './components/admin/CreateAdmin';
import { UserManagement } from './components/admin/UserManagement';

import './i18n/i18n';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <div>
        {isAuthenticated && <Header />}
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/investments" 
            element={isAuthenticated ? <InvestmentsPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/investments/:id" 
            element={isAuthenticated ? <InvestmentDetails /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/expenses" 
            element={isAuthenticated ? <ExpensesPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/settings" 
            element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} 
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/create-admin" element={<CreateAdmin />} />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute role="admin">
                <UserManagement />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster position="top-right" />
        <UserStatusMonitor />
      </div>
    </BrowserRouter>
  );
}

export default App;