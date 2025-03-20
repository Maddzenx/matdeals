import { useState, useEffect } from 'react';

/**
 * Hook to track if this is the first load of the app in the current session
 */
export const useAppSession = () => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Set the flag to false after first mount
  useEffect(() => {
    // Keep the flag as true during the initial render
    // Then set to false to prevent further "first load" actions
    if (isFirstLoad) {
      // Use RAF to ensure this runs after the initial render
      const timerId = setTimeout(() => {
        setIsFirstLoad(false);
      }, 500);
      
      return () => clearTimeout(timerId);
    }
  }, [isFirstLoad]);
  
  return { isFirstLoad };
};
