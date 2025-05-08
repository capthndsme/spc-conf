import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * A hook that syncs state with URL query parameters
 * @param initialState Initial state value or function that returns initial state
 * @returns [state, setState] tuple similar to useState
 */
export function useQueryParamState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void] {
  const [state, setState] = useState<T>(initialState);
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper function to convert object to URL parameters
  const objectToUrlParams = useCallback((obj: any): URLSearchParams => {
    const params = new URLSearchParams();
    
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          if (value !== undefined && value !== null) {
            params.set(key, String(value));
          }
        }
      }
    }
    
    return params;
  }, []);

  // Custom setState that also updates URL parameters
  const setStateWithParams = useCallback(
    (newState: T | ((prevState: T) => T)) => {
      setState(prev => {
        // Calculate the next state
        const nextState = typeof newState === 'function' 
          ? (newState as (prevState: T) => T)(prev)
          : newState;
        
        // Update URL params
        setSearchParams(objectToUrlParams(nextState));
        
        return nextState;
      });
    },
    [setSearchParams, objectToUrlParams]
  );

  // Initialize state from URL params on mount
  useEffect(() => {
    const urlParams = Object.fromEntries(searchParams.entries());
    
    if (Object.keys(urlParams).length === 0) {
      return; // No URL params to apply
    }
    
    // Get initial default value
    const defaultValue = typeof initialState === 'function' 
      ? (initialState as () => T)() 
      : initialState;
    
    // Merge default with URL params
    const mergedState = typeof defaultValue === 'object' && defaultValue !== null
      ? { ...defaultValue, ...urlParams }
      : urlParams as unknown as T;
    
    setState(mergedState);
  }, []); // Run only on mount

  return useMemo(
    () => [state, setStateWithParams],
    [state, setStateWithParams]
  );
}