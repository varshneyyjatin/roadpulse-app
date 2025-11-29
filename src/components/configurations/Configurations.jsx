import { useState, useEffect } from 'react';
import { useAccessControl } from '../../contexts/AccessControl';
import ConfigurationOverview from './ConfigurationOverview';
import CameraSettings from './CameraSettings';
import CheckpointSettings from './CheckpointSettings';
import UserAccessSettings from './UserAccessSettings';
import AddUpdateCamera from './AddUpdateCamera';
import PageHeader from '../common/PageHeader';

const Configurations = () => {
  const { hasPermissionForComponent } = useAccessControl();
  
  // Get initial page from sessionStorage (persists during refresh, clears on tab close)
  const [activePage, setActivePage] = useState(() => {
    return sessionStorage.getItem('configActivePage') || 'overview';
  });
  
  const [editingCamera, setEditingCamera] = useState(() => {
    const saved = sessionStorage.getItem('configEditingCamera');
    return saved ? JSON.parse(saved) : null;
  });

  // Save active page to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('configActivePage', activePage);
  }, [activePage]);

  // Save editing camera to sessionStorage whenever it changes
  useEffect(() => {
    if (editingCamera) {
      sessionStorage.setItem('configEditingCamera', JSON.stringify(editingCamera));
    } else {
      sessionStorage.removeItem('configEditingCamera');
    }
  }, [editingCamera]);

  // Reset to overview only when component first mounts (tab change)
  useEffect(() => {
    // Check if this is a fresh mount (not a refresh)
    const isTabChange = !sessionStorage.getItem('configMounted');
    
    if (isTabChange) {
      setActivePage('overview');
      setEditingCamera(null);
      sessionStorage.setItem('configMounted', 'true');
    }

    // Cleanup on unmount (tab change)
    return () => {
      sessionStorage.removeItem('configMounted');
    };
  }, []);

  const handleNavigateToAddCamera = (camera) => {
    setEditingCamera(camera);
    setActivePage('addCamera');
  };

  const getPageTitle = () => { 
    switch (activePage) {
      case 'camera':
        return 'Camera Settings';
      case 'addCamera':
        return editingCamera ? 'Update Camera' : 'Add Camera';
      case 'checkpoint':
        return 'Checkpoint Settings';
      case 'userAccess':
        return 'User Access Settings';
      default:
        return 'System Configurations';
    }
  };

  const getPageDescription = () => {
    switch (activePage) {
      case 'camera':
        return 'Configure ANPR camera settings and detection parameters';
      case 'addCamera':
        return editingCamera ? 'Modify camera configuration' : 'Configure a new camera';
      case 'checkpoint':
        return 'Manage checkpoints and location-based configurations';
      case 'userAccess':
        return 'Control user permissions, roles and access levels';
      default:
        return 'Manage system settings, camera configurations, and user access control';
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [{ label: 'Configurations', onClick: () => setActivePage('overview') }];
    
    if (activePage === 'camera') {
      breadcrumbs.push({ label: 'Camera Settings', onClick: null });
    } else if (activePage === 'addCamera') {
      breadcrumbs.push({ label: 'Camera Settings', onClick: () => setActivePage('camera') });
      breadcrumbs.push({ label: editingCamera ? 'Update Camera' : 'Add Camera', onClick: null });
    } else if (activePage === 'checkpoint') {
      breadcrumbs.push({ label: 'Checkpoint Settings', onClick: null });
    } else if (activePage === 'userAccess') {
      breadcrumbs.push({ label: 'User Access Settings', onClick: null });
    }
    
    return breadcrumbs;
  };

  return (
    <div className="bg-white dark:bg-transparent min-h-screen transition-colors duration-300">
      <PageHeader
        title={getPageTitle()}
        description={getPageDescription()}
      />
      
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Breadcrumb Navigation */}
        {activePage !== 'overview' && (
          <nav className="mb-6 flex items-center gap-2 text-sm">
            {getBreadcrumbs().map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Render Active Page */}
        {activePage === 'overview' && <ConfigurationOverview onNavigate={setActivePage} />}
        {activePage === 'camera' && (
          <CameraSettings 
            hasPermissionForComponent={hasPermissionForComponent}
            onNavigateToAddCamera={handleNavigateToAddCamera}
          />
        )}
        {activePage === 'addCamera' && (
          <AddUpdateCamera
            camera={editingCamera}
            onBack={() => {
              setEditingCamera(null);
              setActivePage('camera');
            }}
            onSuccess={() => {
              setEditingCamera(null);
              setActivePage('camera');
            }}
          />
        )}
        {activePage === 'checkpoint' && <CheckpointSettings hasPermissionForComponent={hasPermissionForComponent} />}
        {activePage === 'userAccess' && <UserAccessSettings hasPermissionForComponent={hasPermissionForComponent} />}
      </div>
    </div>
  );
};

export default Configurations;
