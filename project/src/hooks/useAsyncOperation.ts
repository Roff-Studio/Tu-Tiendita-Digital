import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOperationReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

// FIXED: Enhanced async operation hook with proper memory management
export function useAsyncOperation<T>(
  asyncFunction: (...args: any[]) => Promise<T>
): UseAsyncOperationReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // FIXED: Memory management with refs
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // FIXED: Stable execute function with proper cleanup
  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      if (!mountedRef.current) return null;

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await asyncFunction(...args);
        
        if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
          setState({ data: result, loading: false, error: null });
          return result;
        }
        
        return null;
      } catch (error) {
        if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          setState({ data: null, loading: false, error: errorObj });
        }
        return null;
      }
    },
    [asyncFunction]
  );

  // FIXED: Stable reset function
  const reset = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (mountedRef.current) {
      setState({ data: null, loading: false, error: null });
    }
  }, []);

  // FIXED: Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
}