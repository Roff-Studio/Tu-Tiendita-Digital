// FIXED: Custom loading state hook for consistent UX feedback

import { useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface UseLoadingStateReturn {
  loading: LoadingState;
  isLoading: (key?: string) => boolean;
  setLoading: (key: string, value: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  clearAllLoading: () => void;
}

export const useLoadingState = (initialState: LoadingState = {}): UseLoadingStateReturn => {
  const [loading, setLoadingState] = useState<LoadingState>(initialState);

  const isLoading = useCallback((key?: string): boolean => {
    if (key) {
      return loading[key] || false;
    }
    return Object.values(loading).some(Boolean);
  }, [loading]);

  const setLoading = useCallback((key: string, value: boolean): void => {
    setLoadingState(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const startLoading = useCallback((key: string): void => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string): void => {
    setLoading(key, false);
  }, [setLoading]);

  const clearAllLoading = useCallback((): void => {
    setLoadingState({});
  }, []);

  return {
    loading,
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
    clearAllLoading
  };
};

// Specific loading hooks for common operations
export const useAuthLoading = () => {
  return useLoadingState({
    login: false,
    register: false,
    logout: false,
    profileUpdate: false
  });
};

export const useProductLoading = () => {
  return useLoadingState({
    fetch: false,
    save: false,
    delete: false,
    imageUpload: false,
    availability: false
  });
};