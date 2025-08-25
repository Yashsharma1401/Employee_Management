import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page imports
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeProfile from './pages/employees/EmployeeProfile';
import AttendanceView from './pages/attendance/AttendanceView';
import LeaveManagement from './pages/leave/LeaveManagement';
import PayrollView from './pages/payroll/PayrollView';
import PerformanceView from './pages/performance/PerformanceView';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const { isLoading, isAuthenticated, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        className="bg-gray-50"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <LoginPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                {/* Dashboard routes */}
                <Route
                  path="/"
                  element={
                    user?.role === 'employee' ? (
                      <EmployeeDashboard />
                    ) : (
                      <AdminDashboard />
                    )
                  }
                />

                {/* Employee routes */}
                <Route path="/employees" element={<EmployeeList />} />
                <Route path="/employees/:id" element={<EmployeeProfile />} />
                <Route path="/profile" element={<EmployeeProfile />} />

                {/* Attendance routes */}
                <Route path="/attendance" element={<AttendanceView />} />

                {/* Leave routes */}
                <Route path="/leave" element={<LeaveManagement />} />

                {/* Payroll routes */}
                <Route path="/payroll" element={<PayrollView />} />

                {/* Performance routes */}
                <Route path="/performance" element={<PerformanceView />} />

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
