// Smart authentication utility that handles both registration and login
import { supabase } from '../lib/supabase';

export interface AuthResult {
  status: 'success' | 'error';
  message: string;
  data?: {
    user: any;
    session: any;
  };
}

export interface SmartAuthParams {
  email: string;
  password: string;
}

/**
 * Smart authentication function that attempts registration first,
 * then automatically tries login if user already exists
 */
export const smartAuthenticate = async ({ email, password }: SmartAuthParams): Promise<AuthResult> => {
  // Clean and validate inputs
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // Basic validation
  if (!cleanEmail || !cleanPassword) {
    return {
      status: 'error',
      message: 'Email y contraseña son requeridos'
    };
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      status: 'error',
      message: 'El formato del correo electrónico no es válido'
    };
  }

  // Password strength validation
  if (cleanPassword.length < 6) {
    return {
      status: 'error',
      message: 'La contraseña debe tener al menos 6 caracteres'
    };
  }

  try {
    console.log('🚀 SmartAuth: Attempting registration for:', cleanEmail);
    
    // Step 1: Attempt registration first
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`
      }
    });

    // If registration is successful
    if (!signUpError && signUpData.user) {
      console.log('✅ SmartAuth: Registration successful');
      
      return {
        status: 'success',
        message: signUpData.user.email_confirmed_at 
          ? 'Cuenta creada exitosamente. Bienvenido!'
          : 'Cuenta creada exitosamente. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.',
        data: {
          user: signUpData.user,
          session: signUpData.session
        }
      };
    }

    // Step 2: Check if error indicates user already exists
    if (signUpError) {
      console.log('⚠️ SmartAuth: Registration failed, checking error type:', signUpError.message);
      
      // Check for "User already registered" error
      if (signUpError.message.includes('User already registered') || 
          signUpError.message.includes('already been registered') ||
          signUpError.message.includes('already exists')) {
        
        console.log('🔄 SmartAuth: User exists, attempting login...');
        
        // Step 3: Attempt login with same credentials
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });

        if (!signInError && signInData.user) {
          console.log('✅ SmartAuth: Login successful after registration attempt');
          
          return {
            status: 'success',
            message: 'Sesión iniciada exitosamente. ¡Bienvenido de vuelta!',
            data: {
              user: signInData.user,
              session: signInData.session
            }
          };
        }

        // If login also fails, provide specific error message
        if (signInError) {
          console.log('❌ SmartAuth: Login failed after registration attempt:', signInError.message);
          
          if (signInError.message.includes('Invalid login credentials')) {
            return {
              status: 'error',
              message: 'Esta cuenta ya existe. Por favor, verifica tu contraseña o usa la opción de recuperar contraseña.'
            };
          }
          
          if (signInError.message.includes('Email not confirmed')) {
            return {
              status: 'error',
              message: 'Esta cuenta existe pero no ha sido confirmada. Revisa tu correo electrónico para confirmar tu cuenta.'
            };
          }

          return {
            status: 'error',
            message: 'Esta cuenta ya existe pero no se pudo iniciar sesión. Verifica tu contraseña.'
          };
        }
      }

      // Handle other registration errors
      return {
        status: 'error',
        message: getAuthErrorMessage(signUpError.message)
      };
    }

    // Fallback error
    return {
      status: 'error',
      message: 'Error inesperado durante la autenticación. Por favor intenta nuevamente.'
    };

  } catch (error: any) {
    console.error('💥 SmartAuth: Unexpected error:', error);
    
    // Handle network errors
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.message?.includes('fetch')) {
      return {
        status: 'error',
        message: 'Error de conexión. Verifica tu internet e intenta nuevamente.'
      };
    }

    return {
      status: 'error',
      message: 'Error inesperado. Por favor intenta nuevamente.'
    };
  }
};

/**
 * Enhanced error message mapping for better user experience
 */
const getAuthErrorMessage = (errorMessage: string): string => {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Credenciales incorrectas. Verifica tu email y contraseña.',
    'Email not confirmed': 'Debes confirmar tu email antes de iniciar sesión.',
    'User already registered': 'Este email ya está registrado. Intenta iniciar sesión.',
    'Password should be at least': 'La contraseña debe tener al menos 6 caracteres.',
    'Unable to validate email address': 'El formato del email no es válido.',
    'Signup is disabled': 'El registro está temporalmente deshabilitado.',
    'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.',
    'Password is too weak': 'La contraseña es muy débil. Usa al menos 6 caracteres.',
    'Failed to fetch': 'Error de conexión. Verifica tu internet e intenta nuevamente.',
    'NetworkError': 'Error de red. Verifica tu conexión e intenta nuevamente.'
  };

  // Find matching error message
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  // Default fallback
  return errorMessage || 'Ha ocurrido un error inesperado.';
};

/**
 * Utility function to validate email format
 */
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Utility function to validate password strength
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'La contraseña es requerida' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'La contraseña es demasiado larga' };
  }
  
  return { isValid: true };
};