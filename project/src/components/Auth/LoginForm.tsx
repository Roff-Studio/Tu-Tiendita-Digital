import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLoadingState } from '../../hooks/useLoadingState';
import { validateEmail, validatePassword } from '../../utils/validation';
import { Eye, EyeOff, Store, AlertCircle, ArrowLeft } from 'lucide-react';
import GoogleAuthButton from './GoogleAuthButton';

interface LoginFormProps {
  onToggleMode: () => void;
  onBack: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, onBack }) => {
  const { login, error: authError, clearError } = useAuth();
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // FIXED: Enhanced validation with real-time feedback
  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = {};

    switch (field) {
      case 'email':
        const emailValidation = validateEmail(value);
        if (!emailValidation.isValid) {
          errors.email = emailValidation.errors[0];
        }
        break;
      case 'password':
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.isValid) {
          errors.password = passwordValidation.errors[0];
        }
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: errors[field] || ''
    }));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateField('email', value);
    if (authError) clearError();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validateField('password', value);
    if (authError) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});
    if (authError) clearError();

    // Validate all fields
    validateField('email', email);
    validateField('password', password);

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      return;
    }

    startLoading('login');
    
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (error: any) {
      console.error('Login error:', error);
      // Error is handled by AuthContext
    } finally {
      stopLoading('login');
    }
  };

  const hasValidationErrors = Object.values(validationErrors).some(error => error);
  const isFormValid = email.trim() && password && !hasValidationErrors;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
            disabled={isLoading('login')}
            aria-label="Volver a la página principal"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Volver</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Bienvenido de vuelta</h1>
            <p className="text-gray-600 mt-2">Inicia sesión en tu catálogo</p>
          </div>

          {/* FIXED: Enhanced error display with proper accessibility */}
          {authError && (
            <div 
              className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start space-x-2"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p className="text-red-600 text-sm">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
                  validationErrors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="tu@correo.com"
                required
                disabled={isLoading('login')}
                autoComplete="email"
                aria-describedby={validationErrors.email ? 'email-error' : undefined}
                aria-invalid={!!validationErrors.email}
              />
              {validationErrors.email && (
                <p id="email-error" className="text-sm text-red-600 mt-1" role="alert">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 transition-colors ${
                    validationErrors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Tu contraseña"
                  required
                  disabled={isLoading('login')}
                  autoComplete="current-password"
                  aria-describedby={validationErrors.password ? 'password-error' : 'password-help'}
                  aria-invalid={!!validationErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-blue-500 rounded"
                  disabled={isLoading('login')}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {validationErrors.password ? (
                <p id="password-error" className="text-sm text-red-600 mt-1" role="alert">
                  {validationErrors.password}
                </p>
              ) : (
                <p id="password-help" className="text-sm text-gray-500 mt-1">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading('login') || !isFormValid}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-describedby="login-button-help"
            >
              {isLoading('login') ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
            <p id="login-button-help" className="sr-only">
              Presiona Enter o haz clic para iniciar sesión
            </p>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>

          {/* Google Auth Button */}
          <GoogleAuthButton disabled={isLoading('login')} />

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <button
                onClick={onToggleMode}
                className="text-blue-600 font-medium hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                disabled={isLoading('login')}
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;