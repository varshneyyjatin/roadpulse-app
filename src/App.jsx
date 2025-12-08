import { useState, useEffect } from 'react';
import { AccessControlProvider, useAccessControl } from './contexts/AccessControl';
import Login from './components/auth/Login';
import Navbar from './components/layout/Navbar';
import Topbar from './components/layout/Topbar';
import Footer from './components/layout/Footer';
import Dashboard from './components/dashboard/Dashboard';
import Reports from './components/reports/Reports';
import Watchlist from './components/watchlist/Watchlist';
import Drivers from './components/drivers/Drivers';
import Configurations from './components/configurations/Configurations';
import Notifications from './components/notifications/Notifications';
import Toast from './components/common/Toast';
import { FullPageLoader } from './components/common/Loader';
import './App.css';
import './dark-mode.css';

const AppContent = () => {
  const { loading, isAuthenticated, accessControl } = useAccessControl();
  const [activeTab, setActiveTab] = useState(() => {
    // Get saved tab from localStorage, default to null
    return localStorage.getItem('activeTab') || null;
  });
  const [toast, setToast] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Listen for session expiry and toast events
  useEffect(() => {
    const handleSessionExpired = () => {
      showToast('Session expired. Please login again.', 'error');
    };

    const handleShowToast = (event) => {
      const { message, type } = event.detail;
      showToast(message, type);
    };

    window.addEventListener('session-expired', handleSessionExpired);
    window.addEventListener('show-toast', handleShowToast);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
      window.removeEventListener('show-toast', handleShowToast);
    };
  }, []);

  // Get primary tab from access control
  const getPrimaryTab = () => {
    if (!accessControl?.tabs) return 'Dashboard';
    const sortedTabs = [...accessControl.tabs].sort((a, b) => a.display_order - b.display_order);
    return sortedTabs[0]?.tab_name || 'Dashboard';
  };

  // Handle tab change with persistence
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    localStorage.setItem('activeTab', tabName);
  };

  // Set primary tab on initial login
  if (isAuthenticated && isInitialLoad && accessControl) {
    if (!activeTab) {
      // First time login or no saved tab - go to primary tab
      const primaryTab = getPrimaryTab();
      setActiveTab(primaryTab);
      localStorage.setItem('activeTab', primaryTab);
    }
    setIsInitialLoad(false);
  }

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Close toast
  const closeToast = () => {
    setToast(null);
  };

  // Handle login success
  const handleLoginSuccess = () => {
    // Clear any saved tab on fresh login
    localStorage.removeItem('activeTab');
    setActiveTab(null);
    setIsInitialLoad(true);
    showToast('Welcome back! Login successful', 'success');
  };

  if (loading) {
    return <FullPageLoader message="Verifying credentials..." />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      </>
    );
  }

  // If still no active tab set (shouldn't happen, but safety check)
  const currentTab = activeTab || getPrimaryTab();

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Reports':
        return <Reports />;
      case 'Watchlist':
        return <Watchlist />;
      case 'Drivers':
        return <Drivers />;
      case 'Configurations':
        return <Configurations />;
      case 'Notifications':
        return <Notifications />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        <Navbar setActiveTab={handleTabChange} onLogout={() => showToast('Logged out successfully', 'info')} />
        <Topbar activeTab={currentTab} setActiveTab={handleTabChange} />
        {renderActiveTab()}
        <Footer />
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </>
  );
};

// Main App Component
function App() {
  return (
    <AccessControlProvider>
      <AppContent />
    </AccessControlProvider>
  );
}

export default App;
