import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { supabase } from './lib/supabase';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingState from './components/common/LoadingState';
import BoltBadge from './components/common/BoltBadge';
import PerformanceMonitor from './components/analytics/PerformanceMonitor';
import AuthContainer from './components/Auth/AuthContainer';
import OnboardingWizard from './components/Onboarding/OnboardingWizard';
import Dashboard from './components/Dashboard/Dashboard';
import AnalyticsDashboard from './components/Dashboard/AnalyticsDashboard';
import PublicCatalog from './components/PublicCatalog/PublicCatalog';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import TermsOfService from './components/Legal/TermsOfService';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ConnectionError: React.FC = () => {
  const { retryConnection } = useAuth();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await retryConnection();
    setRetrying(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error de Conexión</h1>
        <p className="text-gray-600 mb-6">
          No se puede conectar con el servidor. Verifica tu conexión a internet y las configuraciones de Supabase.
        </p>
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${retrying ? 'animate-spin' : ''}`} />
          <span>{retrying ? 'Reintentando...' : 'Reintentar'}</span>
        </button>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, loading, connectionError } = useAuth();

  if (connectionError) {
    return <ConnectionError />;
  }

  if (loading) {
    return <LoadingState isLoading={true} message="Cargando..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!userProfile?.onboardingCompleted) {
    return <OnboardingWizard />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

const AppContent: React.FC = () => {
  const { user, loading, connectionError } = useAuth();
  const navigate = useNavigate();

  // FIXED: Enhanced authentication state change handling
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 App: Auth state changed:', event, session ? `User ${session.user.id}` : 'No session');
      
      // FIXED: Enhanced navigation logic with proper routing
      if (event === 'SIGNED_IN' && session?.user) {
        // Only redirect to dashboard if not already there or in onboarding
        const currentPath = window.location.pathname;
        if (currentPath === '/auth' || currentPath === '/') {
          navigate('/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        // Redirect to auth page when user signs out
        const currentPath = window.location.pathname;
        if (currentPath !== '/auth' && !currentPath.startsWith('/store/') && !currentPath.startsWith('/privacidad') && !currentPath.startsWith('/terminos')) {
          navigate('/auth');
        }
      }
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (connectionError) {
    return <ConnectionError />;
  }

  if (loading) {
    return <LoadingState isLoading={true} message="Inicializando aplicación..." fullScreen />;
  }

  return (
    <>
      <Routes>
        {/* Legal Pages - Accessible to everyone */}
        <Route path="/privacidad" element={<PrivacyPolicy />} />
        <Route path="/terminos" element={<TermsOfService />} />
        
        {/* Authentication */}
        <Route path="/auth" element={!user ? <AuthContainer /> : <Navigate to="/dashboard" replace />} />
        
        {/* Public Catalog */}
        <Route path="/store/:slug" element={<PublicCatalog />} />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* NEW: Analytics Dashboard Route */}
        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Default Route */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/auth"} replace />} />
      </Routes>
      
      {/* Global Components */}
      <BoltBadge />
      <PerformanceMonitor />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;