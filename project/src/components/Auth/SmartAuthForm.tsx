import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { smartAuthenticate, validateEmailFormat, validatePasswordStrength } from '../../utils/smartAuth';
import { useToast } from '../../contexts/ToastContext';
import { Eye, EyeOff, Store, AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import GoogleAuthButton from './GoogleAuthButton';

interface SmartAuthFormProps {
  onBack: () => void;
}

const SmartAuthForm: React.FC<SmartAuthFormProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Real-time field validation
  const validateField = useCallback((field: string, value: string) => {
    const errors: Record<string, string> = {};

    switch (field) {
      case 'email':
        if (!value.trim()) {
          errors.email = 'El correo electrónico es requerido';
        } else if (!validateEmailFormat(value)) {
          errors.email = 'El formato del correo electrónico no es válido';
        }
        break;
      case 'password':
        const passwordValidation = validatePasswordStrength(value);
        if (!passwordValidation.isValid) {
          errors.password = passwordValidation.message || 'Contraseña inválida';
        }
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: errors[field] || ''
    }));
  }, []);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    validateField('email', value);
    if (error) setError('');
  }, [validateField, error]);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    validateField('password', value);
    if (error) setError('');
  }, [validateField, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous states
    setError('');
    setSuccess('');
    setValidationErrors({});

    // Validate all fields
    validateField('email', email);
    validateField('password', password);

    // Check for validation errors
    const emailValid = validateEmailFormat(email);
    const passwordValid = validatePasswordStrength(password);

    if (!emailValid || !passwordValid.isValid) {
      return;
    }

    setLoading(true);

    try {
      const result = await smartAuthenticate({
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      if (result.status === 'success') {
        setSuccess(result.message);
        showToast(result.message, 'success');
        
        // Clear form
        setEmail('');
        setPassword('');
        
        // Navigate to dashboard after successful authentication
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(result.message);
        showToast(result.message, 'error');
      }
    } catch (error: any) {
      console.error('SmartAuth form error:', error);
      const errorMessage = 'Error inesperado. Por favor intenta nuevamente.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
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
            disabled={loading}
            aria-label="Volver a la página principal"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Volver</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Accede a tu cuenta</h1>
            <p className="text-gray-600 mt-2">Inicia sesión o crea una cuenta nueva</p>
          </div>

          {/* Error Display */}
          {error && (
            <div 
              className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start space-x-2"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Success Display */}
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
              <label htmlFor="smart-email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico *
              </label>
              <input
                id="smart-email"
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
                disabled={loading}
                autoComplete="email"
                aria-describedby={validationErrors.email ? 'smart-email-error' : undefined}
                aria-invalid={!!validationErrors.email}
              />
              {validationErrors.email && (
                <p id="smart-email-error" className="text-sm text-red-600 mt-1" role="alert">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="smart-password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  id="smart-password"
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
                  disabled={loading}
                  autoComplete="current-password"
                  aria-describedby={validationErrors.password ? 'smart-password-error' : 'smart-password-help'}
                  aria-invalid={!!validationErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-blue-500 rounded"
                  disabled={loading}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {validationErrors.password ? (
                <p id="smart-password-error" className="text-sm text-red-600 mt-1" role="alert">
                  {validationErrors.password}
                </p>
              ) : (
                <p id="smart-password-help" className="text-sm text-gray-500 mt-1">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Procesando...</span>
                </span>
              ) : (
                'Continuar'
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
          <GoogleAuthButton disabled={loading} />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad.
            </p>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">¿Cómo funciona?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Si no tienes cuenta, se creará automáticamente</li>
              <li>• Si ya tienes cuenta, iniciarás sesión directamente</li>
              <li>• No necesitas recordar si ya te registraste antes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAuthForm;