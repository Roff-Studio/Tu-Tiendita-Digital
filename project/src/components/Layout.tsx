import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Store, AlertCircle, ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = "Mi Catálogo" }) => {
  const { logout, userProfile, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're in analytics view
  const isAnalyticsView = location.pathname.includes('/analytics');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isAnalyticsView ? (
                // Back button for analytics view
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1 mr-2"
                  aria-label="Volver"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-sm font-medium">Volver</span>
                </button>
              ) : (
                <Store className="h-6 w-6 text-blue-600" aria-hidden="true" />
              )}
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            </div>
            
            {/* Only show logout button if NOT in analytics view */}
            {!isAnalyticsView && (
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {userProfile?.storeSlug && (
            <p className="text-sm text-gray-500 mt-1">
              Tu tienda: <span className="font-medium">/{userProfile.storeSlug}</span>
            </p>
          )}
          
          {/* Display auth errors in layout */}
          {authError && (
            <div 
              className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2 flex items-start space-x-2"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p className="text-red-600 text-xs">{authError}</p>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-md mx-auto px-4 py-6" role="main">
        {children}
      </main>
    </div>
  );
};

export default Layout;