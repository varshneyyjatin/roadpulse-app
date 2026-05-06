import { useMemo } from 'react';

const BlacklistDetailsModal = ({ isOpen, onClose, dashboardData }) => {
  // Filter blacklisted vehicles from dashboard data
  const blacklistData = useMemo(() => {
    if (!dashboardData?.summary_data) return [];
    return dashboardData.summary_data.filter(vehicle => vehicle.is_blacklisted === true);
  }, [dashboardData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 dark:from-red-600 dark:to-red-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Blacklisted Vehicles</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Restricted vehicles detected</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {blacklistData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-900 dark:text-white font-semibold mb-2">No blacklisted vehicles</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">No restricted vehicles detected in the selected period</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {blacklistData.map((vehicle) => {
                const timestamp = new Date(vehicle.timestamp);
                const dateStr = timestamp.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const timeStr = timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                
                return (
                  <div 
                    key={vehicle.log_id}
                    className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-200 dark:border-slate-600 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-lg font-bold text-red-700 dark:text-red-400">{vehicle.plate_number}</p>
                          </div>
                          <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium rounded">
                            BLACKLISTED
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{vehicle.location_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Checkpoint</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{vehicle.checkpoint_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Detection Time</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {dateStr} · {timeStr}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Camera</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{vehicle.camera_name || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <img 
                          src={vehicle.latest_data_number_plate_image || vehicle.number_plate_image || '/placeholder-plate.svg'} 
                          alt={vehicle.plate_number}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-slate-600"
                          onError={(e) => { e.target.src = '/placeholder-plate.svg'; }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {blacklistData.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total: <span className="font-semibold text-gray-900 dark:text-white">{blacklistData.length}</span> blacklisted vehicle{blacklistData.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlacklistDetailsModal;
