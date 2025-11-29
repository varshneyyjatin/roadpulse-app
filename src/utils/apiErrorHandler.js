/**
 * API Error Handler Utility
 * Handles different types of API errors and returns user-friendly messages
 */

export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export const ERROR_MESSAGES = {
  [API_ERROR_TYPES.NETWORK_ERROR]: {
    title: 'Connection Failed',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    icon: 'network'
  },
  [API_ERROR_TYPES.SERVER_ERROR]: {
    title: 'Server Error',
    message: 'The server is currently unavailable. Our team has been notified. Please try again in a few moments.',
    icon: 'server'
  },
  [API_ERROR_TYPES.TIMEOUT_ERROR]: {
    title: 'Request Timeout',
    message: 'The request took too long to complete. Please check your connection and try again.',
    icon: 'timeout'
  },
  [API_ERROR_TYPES.UNAUTHORIZED]: {
    title: 'Authentication Required',
    message: 'Your session has expired. Please log in again to continue.',
    icon: 'auth'
  },
  [API_ERROR_TYPES.FORBIDDEN]: {
    title: 'Access Denied',
    message: 'You do not have permission to access this resource.',
    icon: 'forbidden'
  },
  [API_ERROR_TYPES.NOT_FOUND]: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
    icon: 'notfound'
  },
  [API_ERROR_TYPES.VALIDATION_ERROR]: {
    title: 'Invalid Data',
    message: 'Please check your input and try again.',
    icon: 'validation'
  },
  [API_ERROR_TYPES.UNKNOWN_ERROR]: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again later.',
    icon: 'error'
  }
};

/**
 * Determine error type from error object
 */
export const getErrorType = (error) => {
  // Network error (no response from server)
  if (!error.response && error.request) {
    return API_ERROR_TYPES.NETWORK_ERROR;
  }

  // Timeout error
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return API_ERROR_TYPES.TIMEOUT_ERROR;
  }

  // HTTP status code errors
  if (error.response) {
    const status = error.response.status;
    
    if (status === 401) return API_ERROR_TYPES.UNAUTHORIZED;
    if (status === 403) return API_ERROR_TYPES.FORBIDDEN;
    if (status === 404) return API_ERROR_TYPES.NOT_FOUND;
    if (status === 422 || status === 400) return API_ERROR_TYPES.VALIDATION_ERROR;
    if (status >= 500) return API_ERROR_TYPES.SERVER_ERROR;
  }

  return API_ERROR_TYPES.UNKNOWN_ERROR;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error) => {
  const errorType = getErrorType(error);
  const errorInfo = ERROR_MESSAGES[errorType];

  // Check if server provided a custom message
  const serverMessage = error.response?.data?.message || error.response?.data?.error;

  return {
    type: errorType,
    title: errorInfo.title,
    message: serverMessage || errorInfo.message,
    icon: errorInfo.icon,
    statusCode: error.response?.status
  };
};

/**
 * Handle API error and return formatted error object
 */
export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);

  const errorInfo = getErrorMessage(error);

  return {
    success: false,
    error: {
      ...errorInfo,
      message: customMessage || errorInfo.message,
      originalError: error
    }
  };
};

/**
 * Check if error is a server/network error (for retry logic)
 */
export const isRetryableError = (error) => {
  const errorType = getErrorType(error);
  return [
    API_ERROR_TYPES.NETWORK_ERROR,
    API_ERROR_TYPES.SERVER_ERROR,
    API_ERROR_TYPES.TIMEOUT_ERROR
  ].includes(errorType);
};
