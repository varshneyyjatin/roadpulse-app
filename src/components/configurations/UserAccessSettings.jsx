const UserAccessSettings = ({ hasPermissionForComponent }) => {
  // Permission check
  const canViewUserAccessSettings = hasPermissionForComponent ? hasPermissionForComponent('Configurations', 'comp035', 'can_view') : true;
  
  // If no permission, don't render anything
  if (!canViewUserAccessSettings) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Coming Soon Message */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-1">User Access Configuration</h3>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              This feature is currently under development. User access and permission management will be available soon through the Access Matrix system.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upcoming Features</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">User Management</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create, edit, and manage user accounts and profiles</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Role-Based Access Control</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Define roles and assign permissions to user groups</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Permission Matrix</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Granular control over feature access and data visibility</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Access Matrix Integration</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enable/disable features dynamically through Access Matrix</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserAccessSettings;
