import { useAccessControl } from '../../contexts/AccessControl';

const ConfigurationOverview = ({ onNavigate }) => {
  const { hasPermissionForComponent } = useAccessControl();
  
  // Permission checks - if no components assigned, show all by default
  const canViewCameraSettings = hasPermissionForComponent('Configurations', 'comp031', 'can_view');
  const canViewCheckpointSettings = hasPermissionForComponent('Configurations', 'comp033', 'can_view');
  const canViewUserAccessSettings = hasPermissionForComponent('Configurations', 'comp035', 'can_view');
  
  console.log('Configuration Permissions:', {
    canViewCameraSettings,
    canViewCheckpointSettings,
    canViewUserAccessSettings
  });

  return (
    <div>
      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Camera Settings */}
        {canViewCameraSettings && (
          <div 
          onClick={() => onNavigate('camera')}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Camera Settings</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">ANPR camera config</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Manage camera configurations and detection settings</p>
          <span className="text-sm text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
            Configure 
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
        )}

        {/* Checkpoint Settings */}
        {canViewCheckpointSettings && (
          <div 
          onClick={() => onNavigate('checkpoint')}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Checkpoint Settings</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Location management</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Configure checkpoints and location-based settings</p>
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
            Configure 
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
        )}

        {/* User Access Settings */}
        {canViewUserAccessSettings && (
          <div 
            onClick={() => onNavigate('userAccess')}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-green-300 dark:hover:border-green-700 transition-all cursor-pointer group"
          >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Access Settings</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Permissions & roles</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Manage user permissions, roles and access control</p>
          <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
            Configure 
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
        )}
      </div>
    </div>
  );
};

export default ConfigurationOverview;
