import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Store, MessageCircle, Check, AlertCircle } from 'lucide-react';

const OnboardingWizard: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [storeSlug, setStoreSlug] = useState('');
  const [storeName, setStoreName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // FIXED: Memory management with refs
  const mountedRef = useRef(true);
  const slugCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // FIXED: Stable callback with proper cleanup and error handling
  const checkSlugAvailability = useCallback(async (slug: string): Promise<void> => {
    if (!slug.trim() || slug.length < 3 || !mountedRef.current) {
      setSlugAvailable(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setCheckingSlug(true);
    setError('');
    
    try {
      console.log('Checking slug availability for:', slug);
      
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('store_slug', slug)
        .maybeSingle();

      // Check if request was aborted
      if (signal.aborted || !mountedRef.current) {
        return;
      }

      if (error) {
        console.error('Error checking slug:', error);
        // If there's an error, assume the slug is available to not block the user
        setSlugAvailable(true);
        return;
      }

      const isAvailable = !data;
      console.log('Slug availability result:', { slug, isAvailable });
      setSlugAvailable(isAvailable);
    } catch (error: any) {
      if (!signal.aborted && mountedRef.current) {
        console.error('Error checking slug availability:', error);
        // On error, assume available to not block user
        setSlugAvailable(true);
      }
    } finally {
      if (mountedRef.current && !signal.aborted) {
        setCheckingSlug(false);
      }
    }
  }, []);

  // FIXED: Proper slug change handler with cleanup
  const handleSlugChange = useCallback((value: string): void => {
    // Clean the slug: only letters, numbers, hyphens, and underscores
    const cleanSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\-_]/g, '') // Only allow letters, numbers, hyphens, underscores
      .replace(/[-_]{2,}/g, '-') // Replace multiple consecutive special chars with single hyphen
      .replace(/^[-_]+|[-_]+$/g, '') // Remove leading/trailing special chars
      .substring(0, 50); // Limit to 50 characters
    
    setStoreSlug(cleanSlug);
    setSlugAvailable(null);
    
    // Clear previous timeout
    if (slugCheckTimeoutRef.current) {
      clearTimeout(slugCheckTimeoutRef.current);
      slugCheckTimeoutRef.current = null;
    }
    
    // Debounce the availability check
    if (cleanSlug.length >= 3) {
      slugCheckTimeoutRef.current = setTimeout(() => {
        checkSlugAvailability(cleanSlug);
      }, 800);
    }
  }, [checkSlugAvailability]);

  // FIXED: Stable callback with proper validation
  const handleStep1Submit = useCallback((): void => {
    if (!storeSlug.trim() || !storeName.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }
    if (storeSlug.length < 3) {
      setError('La URL debe tener al menos 3 caracteres');
      return;
    }
    if (slugAvailable === false) {
      setError('Esta URL ya está en uso. Por favor elige otra.');
      return;
    }
    
    setError('');
    setStep(2);
  }, [storeSlug, storeName, slugAvailable]);

  // FIXED: Stable callback with comprehensive validation and error handling
  const handleOnboardingSubmit = useCallback(async (): Promise<void> => {
    if (!whatsappNumber.trim()) {
      setError('Por favor ingresa tu número de WhatsApp');
      return;
    }

    // Validate WhatsApp number format
    const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
    if (cleanNumber.length < 10) {
      setError('El número de WhatsApp debe tener al menos 10 dígitos');
      return;
    }

    // Check if user is available
    if (!user) {
      setError('Error: Usuario no encontrado. Por favor recarga la página.');
      return;
    }

    if (!mountedRef.current) return;

    setLoading(true);
    setError('');

    console.log('🚀 Starting profile update process...');

    try {
      // FIXED: Type-safe profile update
      const profileData = {
        storeSlug,
        storeName,
        whatsappNumber: cleanNumber,
        onboardingCompleted: true,
      };

      console.log('📦 Updating profile with data:', profileData);

      await updateUserProfile(profileData);
      
      if (!mountedRef.current) return;
      
      console.log('✅ Profile updated successfully, navigating to dashboard...');
      
      // Use programmatic navigation
      navigate('/dashboard', { replace: true });
      
    } catch (error: any) {
      console.error('💥 Profile update failed:', error);
      
      if (mountedRef.current) {
        if (error.message?.includes('duplicate key') || error.message?.includes('already exists')) {
          setError('Esta URL ya está en uso. Por favor elige otra.');
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
        } else {
          setError(error.message || 'Error al actualizar el perfil. Por favor intenta nuevamente.');
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [whatsappNumber, user, storeSlug, storeName, updateUserProfile, navigate]);

  // FIXED: Proper cleanup in useEffect
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      console.log('🧹 OnboardingWizard: Cleaning up...');
      mountedRef.current = false;
      
      // Clear timeout
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current);
        slugCheckTimeoutRef.current = null;
      }
      
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              {step === 1 ? <Store className="h-8 w-8 text-blue-600" /> : <MessageCircle className="h-8 w-8 text-blue-600" />}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 1 ? 'Configura tu tienda' : 'Conecta WhatsApp'}
            </h1>
            <p className="text-gray-600 mt-2">
              {step === 1 ? 'Paso 1 de 2' : 'Paso 2 de 2'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de tu tienda
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ej: Roff Studio"
                  required
                  maxLength={100}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de tu tienda
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={storeSlug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="roff-studio"
                    required
                    maxLength={50}
                    disabled={loading}
                  />
                  {checkingSlug && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {!checkingSlug && slugAvailable === true && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                  {!checkingSlug && slugAvailable === false && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 bg-red-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Tu catálogo estará en: <span className="font-medium">{window.location.origin}/store/{storeSlug || 'tu-url'}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Solo letras, números, guiones y guiones bajos (3-50 caracteres)
                </p>
                {slugAvailable === false && (
                  <p className="text-sm text-red-600 mt-1">Esta URL ya está en uso</p>
                )}
                {storeSlug.length > 0 && storeSlug.length < 3 && (
                  <p className="text-sm text-orange-600 mt-1">La URL debe tener al menos 3 caracteres</p>
                )}
              </div>

              <button
                onClick={handleStep1Submit}
                disabled={!storeSlug || !storeName || storeSlug.length < 3 || loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de WhatsApp (con código de país)
                </label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ej: 573001234567"
                  required
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Los clientes podrán contactarte directamente por WhatsApp desde tu catálogo
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Formato: código de país + número (sin espacios ni símbolos)
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Atrás
                </button>
                <button
                  onClick={handleOnboardingSubmit}
                  disabled={loading || !whatsappNumber.trim() || !user}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Finalizar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;