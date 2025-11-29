/**
 * Fetch Wrapper with 401 Session Expiry Handler
 * Use this instead of native fetch for API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Enhanced fetch that handles session expiry globally
 */
export const fetchWithAuth = async (url, options = {}) => {
  // Add auth token to headers
  const token = localStorage.getItem('access_token');
  const tokenType = localStorage.getItem('token_type') || 'bearer';

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `${tokenType} ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Clear auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('activeTab');

      // Dispatch custom event for session expiry
      window.dispatchEvent(new CustomEvent('session-expired'));

      // Small delay to show toast, then reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);

      throw new Error('Session expired');
    }

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Helper to get auth headers
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  const tokenType = localStorage.getItem('token_type') || 'bearer';

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `${tokenType} ${token}`;
  }

  return headers;
};

export default fetchWithAuth;
