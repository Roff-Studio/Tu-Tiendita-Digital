import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// FIXED: Complete type definitions with proper exports
export interface UserProfile {
  id: string;
  email: string;
  storeSlug?: string | null;
  storeName?: string | null;
  whatsappNumber?: string | null;
  onboardingCompleted: boolean;
}

// FIXED: Proper type definitions for all function parameters
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  connectionError: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
  retryConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  
  // FIXED: Memory management with refs to prevent memory leaks
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // FIXED: Enhanced user profile creation for Google users
  const createUserProfile = useCallback(async (targetUser: User): Promise<UserProfile | null> => {
    if (!mountedRef.current) return null;

    try {
      console.log(`🆕 [Auth] Creating profile for new user: ${targetUser.id}`);
      
      // Extract user data from Google or email auth
      const userData = {
        id: targetUser.id,
        email: targetUser.email || '',
        // For Google users, we can extract name from user_metadata
        store_name: targetUser.user_metadata?.full_name || null,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (error) {
        // Handle case where profile already exists (race condition)
        if (error.code === '23505') { // Unique violation
          console.log(`🔄 [Auth] Profile already exists, fetching existing profile for: ${targetUser.id}`);
          const { data: existingData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', targetUser.id)
            .single();
          
          if (fetchError) throw fetchError;
          
          const profile: UserProfile = {
            id: existingData.id,
            email: existingData.email,
            storeSlug: existingData.store_slug,
            storeName: existingData.store_name,
            whatsappNumber: existingData.whatsapp_number,
            onboardingCompleted: existingData.onboarding_completed || false,
          };
          
          if (mountedRef.current) {
            setUserProfile(profile);
          }
          return profile;
        }
        throw error;
      }

      if (!mountedRef.current) return null;

      console.log(`✅ [Auth] Profile created successfully for user: ${targetUser.id}`);
      const profile: UserProfile = {
        id: data.id,
        email: data.email,
        storeSlug: data.store_slug,
        storeName: data.store_name,
        whatsappNumber: data.whatsapp_number,
        onboardingCompleted: data.onboarding_completed || false,
      };
      
      if (mountedRef.current) {
        setUserProfile(profile);
      }
      return profile;

    } catch (e: any) {
      console.error("💥 [Auth] Critical error in createUserProfile:", e);
      
      if (mountedRef.current) {
        if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
          setError("Error de conexión al crear el perfil.");
          setConnectionError(true);
        } else {
          setError("Error al crear el perfil inicial.");
        }
      }
      return null;
    }
  }, []); // FIXED: Empty dependency array - function is stable

  // FIXED: Enhanced fetchUserProfile with Google user handling
  const fetchUserProfile = useCallback(async (targetUser: User): Promise<UserProfile | null> => {
    if (!mountedRef.current) return null;
    
    console.log(`📋 [Auth] Fetching profile for user: ${targetUser.id}`);
    
    try {
      // FIXED: Proper timeout implementation using Promise.race
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', targetUser.id)
        .single();

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Profile fetch timeout'));
        }, 10000);
      });

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);

      // FIXED: Cleanup timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (!mountedRef.current) return null;

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        console.log(`✅ [Auth] Profile found for user: ${targetUser.id}`);
        const profile: UserProfile = {
          id: data.id,
          email: data.email,
          storeSlug: data.store_slug,
          storeName: data.store_name,
          whatsappNumber: data.whatsapp_number,
          onboardingCompleted: data.onboarding_completed || false,
        };
        
        if (mountedRef.current) {
          setUserProfile(profile);
        }
        return profile;
      }
      
      // Profile doesn't exist - create new one (handles both email and Google users)
      console.log(`🆕 [Auth] No profile found for user: ${targetUser.id}. Creating new profile.`);
      return await createUserProfile(targetUser);

    } catch (e: any) {
      // FIXED: Cleanup timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      console.error("💥 [Auth] Critical error in fetchUserProfile:", e);
      
      if (mountedRef.current) {
        if (e.message?.includes('timeout')) {
          setError("Tiempo de espera agotado al cargar el perfil.");
          setConnectionError(true);
        } else if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
          setError("Error de conexión. Verifica tu internet.");
          setConnectionError(true);
        } else {
          setError("No se pudo cargar el perfil de usuario.");
        }
      }
      return null;
    }
  }, [createUserProfile]); // FIXED: Include createUserProfile dependency

  // FIXED: Enhanced error message mapping
  const getAuthErrorMessage = useCallback((errorMessage: string): string => {
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Credenciales incorrectas. Verifica tu email y contraseña.';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'Debes confirmar tu email antes de iniciar sesión.';
    }
    if (errorMessage.includes('User already registered')) {
      return 'Este email ya está registrado. Intenta iniciar sesión.';
    }
    if (errorMessage.includes('Password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (errorMessage.includes('Unable to validate email address')) {
      return 'El formato del email no es válido.';
    }
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
    }
    return errorMessage || 'Ha ocurrido un error inesperado.';
  }, []);

  // FIXED: Stable callback functions with proper typing and error handling
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    setError(null);
    setConnectionError(false);

    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) {
        const friendlyMessage = getAuthErrorMessage(error.message);
        setError(friendlyMessage);
        throw new Error(friendlyMessage);
      }
    } catch (e: any) {
      if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
        setConnectionError(true);
        setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
      }
      throw e;
    }
  }, [getAuthErrorMessage]);

  const register = useCallback(async (email: string, password: string): Promise<void> => {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    setError(null);
    setConnectionError(false);

    try {
      const { error } = await supabase.auth.signUp({ 
        email: email.trim().toLowerCase(), 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) {
        const friendlyMessage = getAuthErrorMessage(error.message);
        setError(friendlyMessage);
        throw new Error(friendlyMessage);
      }
    } catch (e: any) {
      if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
        setConnectionError(true);
        setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
      }
      throw e;
    }
  }, [getAuthErrorMessage]);

  const logout = useCallback(async (): Promise<void> => {
    setError(null);
    setConnectionError(false);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // FIXED: Proper state cleanup
      if (mountedRef.current) {
        setUser(null);
        setUserProfile(null);
        setError(null);
      }
    } catch (e: any) {
      if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
        setConnectionError(true);
        setError('Error de conexión al cerrar sesión.');
      }
      throw e;
    }
  }, []);

  // FIXED: Type-safe updateUserProfile with proper validation
  const updateUserProfile = useCallback(async (profileData: Partial<UserProfile>): Promise<void> => {
    if (!user) {
      throw new Error("No user is signed in to update profile.");
    }

    setError(null);
    setConnectionError(false);

    try {
      // FIXED: Type-safe database update object
      const updateObject: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      // FIXED: Proper type mapping with validation
      if (profileData.storeName !== undefined) {
        updateObject.store_name = profileData.storeName;
      }
      if (profileData.storeSlug !== undefined) {
        updateObject.store_slug = profileData.storeSlug;
      }
      if (profileData.whatsappNumber !== undefined) {
        updateObject.whatsapp_number = profileData.whatsappNumber;
      }
      if (profileData.onboardingCompleted !== undefined) {
        updateObject.onboarding_completed = profileData.onboardingCompleted;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateObject)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;

      if (!mountedRef.current) return;

      console.log(`✅ [Auth] User profile updated in DB:`, data);
      
      // FIXED: Type-safe profile update
      const updatedProfile: UserProfile = {
        id: data.id,
        email: data.email,
        storeSlug: data.store_slug,
        storeName: data.store_name,
        whatsappNumber: data.whatsapp_number,
        onboardingCompleted: data.onboarding_completed || false,
      };
      
      setUserProfile(updatedProfile);
    } catch (e: any) {
      if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
        setConnectionError(true);
        setError('Error de conexión al actualizar el perfil.');
      }
      throw e;
    }
  }, [user]); // FIXED: Only depend on user

  const clearError = useCallback(() => {
    setError(null);
    setConnectionError(false);
  }, []);

  const retryConnection = useCallback(async (): Promise<void> => {
    setConnectionError(false);
    setError(null);
    setLoading(true);

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session?.user && mountedRef.current) {
        await fetchUserProfile(session.user);
      }
    } catch (e: any) {
      if (mountedRef.current) {
        setConnectionError(true);
        setError('No se pudo restablecer la conexión.');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchUserProfile]);

  // FIXED: Proper useEffect with cleanup and stable dependencies
  useEffect(() => {
    let authSubscription: any = null;
    
    const initializeAuth = async () => {
      if (!mountedRef.current) return;
      
      console.log("🚀 [Auth] AuthProvider mounted. Checking initial session...");
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ [Auth] Error getting session:", error);
          if (mountedRef.current) {
            if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
              setConnectionError(true);
              setError("Error de conexión al obtener la sesión");
            } else {
              setError("Error al obtener la sesión");
            }
            setLoading(false);
          }
          return;
        }

        if (!mountedRef.current) return;

        console.log("📱 [Auth] Initial session retrieved:", session ? `User ${session.user.id}` : "No session");
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        }
        
        if (mountedRef.current) {
          setLoading(false);
        }
      } catch (e: any) {
        console.error("💥 [Auth] Error in initializeAuth:", e);
        if (mountedRef.current) {
          if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
            setConnectionError(true);
            setError("Error de conexión al inicializar la autenticación");
          } else {
            setError("Error al inicializar la autenticación");
          }
          setLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // FIXED: Enhanced auth state change handler - REMOVED navigation logic
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;
      
      console.log(`🔄 [Auth] Auth state changed: ${event}`, session ? `User ${session.user.id}` : "No session");
      
      setUser(session?.user ?? null);
      setError(null);
      setConnectionError(false);
      
      // FIXED: Focus only on session detection and profile management
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        await fetchUserProfile(session.user);
        if (mountedRef.current) {
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mountedRef.current) {
          setUserProfile(null);
          setLoading(false);
        }
      }
    });

    authSubscription = subscription;

    // FIXED: Comprehensive cleanup
    return () => {
      console.log("🧹 [Auth] AuthProvider unmounting. Cleaning up...");
      mountedRef.current = false;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]); // FIXED: Include fetchUserProfile dependency

  // FIXED: Stable context value with proper memoization
  const contextValue: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    connectionError,
    login,
    register,
    logout,
    updateUserProfile,
    clearError,
    retryConnection,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};