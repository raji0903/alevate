
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

const DashboardRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'alumni') {
    return <Navigate to="/alumni/dashboard" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/student/dashboard" replace />;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <DashboardRedirect />;
  }

  return children;
};

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated
            ? <DashboardRedirect />
            : <LandingPage />
        }
      />

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

        <Route
          path="/mentors"
          element={
            <ProtectedRoute allowedRoles={['student', 'alumni']}>
              <FindMentorsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumni/:id"
          element={
            <ProtectedRoute allowedRoles={['student', 'alumni']}>
              <AlumniProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedRoute allowedRoles={['student', 'alumni']}>
              <JobsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/referrals"
          element={
            <ProtectedRoute allowedRoles={['student', 'alumni']}>
              <ReferralsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/sessions" element={<MentorshipSessionsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/ai-companion" element={<AlevateAiPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
