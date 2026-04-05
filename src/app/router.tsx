import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '@pages/dashboard/Dashboard';
import { Login, Register, InstagramSuccessPage, useAuthStore } from '@features/auth';
import { Customers } from '@features/customers';
import { Scheduler } from '@features/scheduler';
import { Templates } from '@features/templates';
import { SendNotification } from '@/features/notifications/pages/send-notification-page';
import { BulkSendNotification } from '@/features/notifications/pages/bulk-send-page';
import { MetaDmsPage } from '@/features/meta/pages/meta-dms-page';
import { MetaCallbackPage } from '@/features/meta/pages/meta-callback-page';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const Router = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      }
    />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/customers"
      element={
        <ProtectedRoute>
          <Customers />
        </ProtectedRoute>
      }
    />
    <Route
      path="/templates"
      element={
        <ProtectedRoute>
          <Templates />
        </ProtectedRoute>
      }
    />
    <Route
      path="/send"
      element={
        <ProtectedRoute>
          <SendNotification />
        </ProtectedRoute>
      }
    />
    <Route
      path="/send/bulk"
      element={
        <ProtectedRoute>
          <BulkSendNotification />
        </ProtectedRoute>
      }
    />
    <Route
      path="/scheduler"
      element={
        <ProtectedRoute>
          <Scheduler />
        </ProtectedRoute>
      }
    />
    <Route
      path="/meta/dms"
      element={
        <ProtectedRoute>
          <MetaDmsPage />
        </ProtectedRoute>
      }
    />
    {/* No ProtectedRoute — Meta redirects here, user must land regardless of nav state */}
    <Route path="/meta/callback" element={<MetaCallbackPage />} />
    {/* No ProtectedRoute and no PublicRoute — token arrives here, must store it first */}
    <Route path="/auth/instagram/success" element={<InstagramSuccessPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default Router;
