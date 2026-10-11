import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/student/StudentDashboard';
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import FindMentorsPage from './pages/mentors/FindMentorsPage';
import AlumniProfilePage from './pages/mentors/AlumniProfilePage';
import JobsPage from './pages/jobs/JobsPage';
import ReferralsPage from './pages/referrals/ReferralsPage';
import MentorshipSessionsPage from './pages/sessions/MentorshipSessionsPage';
import MessagesPage from './pages/messages/MessagesPage';
import AlevateAiPage from './pages/ai/AlevateAiPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ProfilePage from './pages/profile/ProfilePage';

// Helper component for role-based dashboard redirect
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'alumni') return <Navigate to="/alumni/dashboard" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <DashboardRedirect />;
  }

  return children;
};

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={isAuthenticated ? <DashboardRedirect /> : <LandingPage />} />

      {/* Authenticated Dashboard & Network Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/dashboard"
          element={
            <ProtectedRoute allowedRoles={['alumni', 'admin']}>
              <AlumniDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/mentors" element={<FindMentorsPage />} />
        <Route path="/alumni/:id" element={<AlumniProfilePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/sessions" element={<MentorshipSessionsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/ai-companion" element={<AlevateAiPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
