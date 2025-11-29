const TimelineModal = ({ isOpen, onClose, vehicleData }) => {
  if (!isOpen || !vehicleData) return null;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date: dateStr, time: timeStr };
  };

  return (
    <div className="fixed inset-0 modal-backdrop z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-b border-gray-200 dark:border-slate-600 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Vehicle Journey Timeline</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span className="font-semibold text-gray-900 dark:text-white">{vehicleData.plate_number}</span> • {vehicleData.timeline?.length || 0} Detections
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1 hover:bg-white/50 dark:hover:bg-slate-600/50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {vehicleData.timeline && vehicleData.timeline.length > 0 ? (
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                {vehicleData.timeline.map((entry, index) => {
                  const { date, time } = formatTimestamp(entry.time);
                  const isLatest = index === vehicleData.timeline.length - 1;
                  
                  return (
                    <div key={index} className="relative flex gap-6 pb-8">
                      {/* Vertical Line */}
                      {index < vehicleData.timeline.length - 1 && (
                        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-300 dark:bg-slate-600"></div>
                      )}
                      
                      {/* Number Circle */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${
                          isLatest 
                            ? 'bg-green-600 dark:bg-green-500 ring-4 ring-green-100 dark:ring-green-900/30' 
                            : 'bg-blue-600 dark:bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        {isLatest && (
                          <span className="absolute -top-2 -right-2 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                              {entry.location_name} - {entry.checkpoint_name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{time} • {date}</p>
                          </div>
                          {isLatest && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
                              Latest
                            </span>
                          )}
                        </div>
                        
                        {/* Image Display */}
                        {entry.image && (
                          <div className="mt-3">
                            <img 
                              src={entry.image} 
                              alt={`Detection at ${entry.location_name}`}
                              className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-slate-600"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 font-semibold">No timeline data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineModal;