import { useEffect, useState } from 'react';

const LocationDetailsModal = ({ isOpen, onClose, locations }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Flatten locations with checkpoints for table view
  const allRows = [];
  locations?.forEach(location => {
    if (location.checkpoints && location.checkpoints.length > 0) {
      location.checkpoints.forEach(checkpoint => {
        allRows.push({
          location_id: location.location_id,
          location_name: location.location_name,
          location_code: location.location_code,
          location_type: location.location_type,
          location_address: location.location_address,
          checkpoint_id: checkpoint.checkpoint_id,
          checkpoint_name: checkpoint.checkpoint_name,
          checkpoint_type: checkpoint.checkpoint_type,
          checkpoint_description: checkpoint.description,
          camera_count: checkpoint.cameras?.length || 0
        });
      });
    } else {
      // Location without checkpoints
      allRows.push({
        location_id: location.location_id,
        location_name: location.location_name,
        location_code: location.location_code,
        location_type: location.location_type,
        location_address: location.location_address,
        checkpoint_id: null,
        checkpoint_name: '-',
        checkpoint_type: '-',
        checkpoint_description: '-',
        camera_count: 0
      });
    }
  });

  // Filter rows based on search
  const filteredRows = allRows.filter(row => 
    row.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.location_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.location_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.checkpoint_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group rows by location to show one row per location
  const groupedLocations = [];
  const locationMap = new Map();

  filteredRows.forEach(row => {
    if (!locationMap.has(row.location_id)) {
      locationMap.set(row.location_id, {
        location_id: row.location_id,
        location_name: row.location_name,
        location_code: row.location_code,
        location_type: row.location_type,
        location_address: row.location_address,
        checkpoints: []
      });
    }
    
    if (row.checkpoint_id) {
      locationMap.get(row.location_id).checkpoints.push({
        checkpoint_name: row.checkpoint_name,
        checkpoint_type: row.checkpoint_type,
        camera_count: row.camera_count
      });
    }
  });

  groupedLocations.push(...locationMap.values());

  return (
    <div className="fixed inset-0 modal-backdrop z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 border-b border-green-200 dark:border-green-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Location Details</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">{locations?.length || 0} location(s) assigned</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1 hover:bg-white/50 dark:hover:bg-slate-600/50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-600">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by location name, code, address, or checkpoint..."
              className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white text-sm transition-all"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {groupedLocations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No locations found matching your search' : 'No locations available'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-slate-600">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Location Name</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Code</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Address</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Checkpoints</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {groupedLocations.map((location) => (
                    <tr key={location.location_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{location.location_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                          {location.location_code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{location.location_type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{location.location_address}</span>
                      </td>
                      <td className="py-3 px-4">
                        {location.checkpoints.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {location.checkpoints.map((checkpoint, idx) => (
                              <span 
                                key={idx}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                                  checkpoint.checkpoint_type === 'Entry' 
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                                }`}
                              >
                                <span>{checkpoint.checkpoint_name}</span>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white/50 dark:bg-black/20 rounded-full">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-xs font-bold">{checkpoint.camera_count}</span>
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">No checkpoints</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-200 dark:border-slate-600 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {groupedLocations.length} of {locations?.length || 0} location(s)
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailsModal;
