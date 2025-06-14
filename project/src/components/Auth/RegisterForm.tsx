import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLoadingState } from '../../hooks/useLoadingState';
import { validateEmail, validatePassword } from '../../utils/validation';
import { Eye, EyeOff, Store, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import GoogleAuthButton from './GoogleAuthButton';

interface RegisterFormProps {
  onToggleMode: () => void;
  onBack: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode, onBack }) => {
  const { register, error: authError, clearError } = useAuth();
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  // FIXED: Enhanced validation with real-time feedback
  const validateField = (field: string, value: string, compareValue?: string) => {
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
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Confirma tu contraseña';
        } else if (compareValue && value !== compareValue) {
          errors.confirmPassword = 'Las contraseñas no coinciden';
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
    // Re-validate confirm password if it has a value
    if (confirmPassword) {
      validateField('confirmPassword', confirmPassword, value);
    }
    if (authError) clearError();
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    validateField('confirmPassword', value, password);
    if (authError) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});
    setSuccess('');
    if (authError) clearError();

    // Validate all fields
    validateField('email', email);
    validateField('password', password);
    validateField('confirmPassword', confirmPassword, password);

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.isValid || !passwordValidation.isValid || password !== confirmPassword) {
      return;
    }

    startLoading('register');
    
    try {
      await register(email.trim().toLowerCase(), password);
      setSuccess('¡Cuenta creada exitosamente! Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.');
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Registration error:', error);
      // Error is handled by AuthContext
    } finally {
      stopLoading('register');
    }
  };

  const hasValidationErrors = Object.values(validationErrors).some(error => error);
  const isFormValid = email.trim() && password && confirmPassword && password === confirmPassword && !hasValidationErrors;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
            disabled={isLoading('register')}
            aria-label="Volver a la página principal"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Volver</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
            <p className="text-gray-600 mt-2">Comienza tu catálogo digital</p>
          </div>

          {/* FIXED: Enhanced error and success display */}
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

          {success && (
            <div 
              className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start space-x-2"
              role="alert"
              aria-live="polite"
            >
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico *
              </label>
              <input
                id="register-email"
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
                disabled={isLoading('register')}
                autoComplete="email"
                aria-describedby={validationErrors.email ? 'register-email-error' : undefined}
                aria-invalid={!!validationErrors.email}
              />
              {validationErrors.email && (
                <p id="register-email-error" className="text-sm text-red-600 mt-1" role="alert">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 transition-colors ${
                    validationErrors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={isLoading('register')}
                  autoComplete="new-password"
                  aria-describedby={validationErrors.password ? 'register-password-error' : 'register-password-help'}
                  aria-invalid={!!validationErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-blue-500 rounded"
                  disabled={isLoading('register')}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {validationErrors.password ? (
                <p id="register-password-error" className="text-sm text-red-600 mt-1" role="alert">
                  {validationErrors.password}
                </p>
              ) : (
                <p id="register-password-help" className="text-sm text-gray-500 mt-1">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña *
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
                  validationErrors.confirmPassword 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Repite tu contraseña"
                required
                disabled={isLoading('register')}
                autoComplete="new-password"
                aria-describedby={validationErrors.confirmPassword ? 'confirm-password-error' : undefined}
                aria-invalid={!!validationErrors.confirmPassword}
              />
              {validationErrors.confirmPassword && (
                <p id="confirm-password-error" className="text-sm text-red-600 mt-1" role="alert">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading('register') || !isFormValid}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading('register') ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creando cuenta...</span>
                </span>
              ) : (
                'Crear cuenta'
              )}
            </button>
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
          <GoogleAuthButton disabled={isLoading('register')} />

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={onToggleMode}
                className="text-blue-600 font-medium hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                disabled={isLoading('register')}
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;