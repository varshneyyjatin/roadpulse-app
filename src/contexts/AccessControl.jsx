import { createContext, useContext, useState, useEffect } from 'react';
import { handleApiError } from '../utils/apiErrorHandler';
import axiosInstance from '../utils/axiosInstance';

const AccessControlContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Custom hook to use access control context
const useAccessControl = () => {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error('useAccessControl must be used within AccessControlProvider');
  }
  return context;
};

// Access Control Provider Component
const AccessControlProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessControl, setAccessControl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserPermissions();
    } else {
      setLoading(false);
      setIsAuthenticated(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        // Try to get server error message
        const errorData = await response.json().catch(() => null);
        const error = new Error('API Error');
        error.response = {
          status: response.status,
          data: errorData
        };
        throw error;
      }

      const data = await response.json();

      // Save token to localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type || 'bearer');

      // Fetch user permissions immediately
      await fetchUserPermissions(false);

      setIsAuthenticated(true);
    } catch (error) {
      // Handle API errors professionally
      const errorInfo = handleApiError(error);

      // For login, customize messages
      if (errorInfo.error.type === 'UNAUTHORIZED') {
        throw new Error('Invalid username or password. Please try again.');
      } else if (errorInfo.error.type === 'NETWORK_ERROR' || errorInfo.error.type === 'SERVER_ERROR') {
        throw new Error('Unable to connect to the server. Please check your connection and try again.');
      } else {
        throw new Error(errorInfo.error.message);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('activeTab');
    setUser(null);
    setAccessControl(null);
    setSelectedLocation(null);
    setIsAuthenticated(false);
  };

  const fetchUserPermissions = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const token = localStorage.getItem('access_token');

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Use axios instance which handles 401 automatically
      const response = await axiosInstance.get('/auth/me/access-control');
      const data = response.data;

      setUser(data.user);
      setAccessControl(data.access_control);
      setIsAuthenticated(true);

      // Set default location
      if (data.access_control?.locations?.length > 0) {
        setSelectedLocation(data.access_control.locations[0]);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      // Don't logout here - axios interceptor will handle 401
      if (error.response?.status !== 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const hasComponentPermission = (tabName, componentCode, permission) => {
    if (!accessControl) return false;

    const tab = accessControl.tabs.find(t => t.tab_name === tabName);
    if (!tab) return false;

    const component = tab.components.find(c => c.component_code === componentCode);
    if (!component) return false;

    return component.permissions[permission] === true;
  };

  const getTabComponents = (tabName) => {
    if (!accessControl) return [];

    const tab = accessControl.tabs.find(t => t.tab_name === tabName);
    return tab?.components || [];
  };

  const hasPermissionForComponent = (tabName, componentCode, permission) => {
    if (!accessControl) {
      console.log('No accessControl data');
      return false;
    }

    const tab = accessControl.tabs.find(t => t.tab_name === tabName);
    if (!tab) {
      console.log(`Tab "${tabName}" not found. Available tabs:`, accessControl.tabs.map(t => t.tab_name));
      return false;
    }

    // If no components are assigned to the tab (empty array), grant all permissions
    if (tab.components.length === 0) {
      console.log(`Tab "${tabName}" has no components, granting all permissions`);
      return true;
    }

    // Otherwise, check specific component permission
    const component = tab.components.find(c => c.component_code === componentCode);
    if (!component) {
      console.log(`Component "${componentCode}" not found in tab "${tabName}"`);
      return false;
    }

    const hasPermission = component.permissions[permission] === true;
    console.log(`Permission check: ${tabName}.${componentCode}.${permission} = ${hasPermission}`);
    return hasPermission;
  };

  const value = {
    user,
    accessControl,
    loading,
    selectedLocation,
    isAuthenticated,
    setSelectedLocation,
    hasComponentPermission,
    hasPermissionForComponent,
    getTabComponents,
    login,
    logout
  };

  return <AccessControlContext.Provider value={value}>{children}</AccessControlContext.Provider>;
};

export { useAccessControl, AccessControlProvider };
