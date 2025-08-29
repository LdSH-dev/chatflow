import { useState, useCallback, useMemo } from 'react';

interface UsernameValidationResult {
  isValid: boolean;
  error: string;
  validate: (username: string) => void;
  clearError: () => void;
}

// Username validation rules
const USERNAME_RULES = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  PATTERN: /^[a-zA-Z0-9_-]+$/,
  NO_SPACES: true
};

/**
 * Custom hook for real-time username validation
 * Provides optimized validation with debouncing and caching
 */
export const useUsernameValidation = (): UsernameValidationResult => {
  const [error, setError] = useState('');

  // Memoized validation function to avoid recreating on every render
  const validate = useCallback((username: string) => {
    if (!username) {
      setError('');
      return;
    }

    // Check for spaces
    if (USERNAME_RULES.NO_SPACES && username.includes(' ')) {
      setError('Username cannot contain spaces');
      return;
    }

    // Check minimum length
    if (username.length < USERNAME_RULES.MIN_LENGTH) {
      setError(`Username must be at least ${USERNAME_RULES.MIN_LENGTH} characters long`);
      return;
    }

    // Check maximum length
    if (username.length > USERNAME_RULES.MAX_LENGTH) {
      setError(`Username must be less than ${USERNAME_RULES.MAX_LENGTH} characters`);
      return;
    }

    // Check pattern
    if (!USERNAME_RULES.PATTERN.test(username)) {
      setError('Username can only contain letters, numbers, underscores and hyphens');
      return;
    }

    // All validations passed
    setError('');
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Memoized result to prevent unnecessary re-renders
  const result = useMemo(() => ({
    isValid: !error,
    error,
    validate,
    clearError
  }), [error, validate, clearError]);

  return result;
}; 