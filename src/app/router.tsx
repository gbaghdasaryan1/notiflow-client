import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '@pages/dashboard/Dashboard';
import { Login, Register, useAuthStore } from '@features/auth';
import { Customers } from '@features/customers';
import { Scheduler } from '@features/scheduler';
import { Templates } from '@features/templates';
import { SendNotification } from '@/features/notifications/pages/send-notification-page';
import { BulkSendNotification } from '@/features/notifications/pages/bulk-send-page';
import { MetaInboxPage, MetaAccountsPage, MetaCallbackPage } from '@/features/meta';

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
      path="/meta/inbox"
      element={
        <ProtectedRoute>
          <MetaInboxPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/meta/accounts"
      element={
        <ProtectedRoute>
          <MetaAccountsPage />
        </ProtectedRoute>
      }
    />
    {/* No ProtectedRoute — Meta redirects here after OAuth */}
    <Route path="/meta/callback" element={<MetaCallbackPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default Router;
