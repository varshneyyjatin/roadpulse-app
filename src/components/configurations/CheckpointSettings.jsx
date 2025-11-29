import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../utils/fetchWrapper';
import { handleApiError } from '../../utils/apiErrorHandler';
import { FullPageLoader } from '../common/Loader';
import ErrorState from '../common/ErrorState';

const CheckpointSettings = ({ hasPermissionForComponent }) => {
  // Permission checks
  const canViewCheckpointSettings = hasPermissionForComponent('Configurations', 'comp033', 'can_view');
  const canAddCheckpoint = hasPermissionForComponent('Configurations', 'comp034', 'can_view');
  
  const [checkpoints, setCheckpoints] = useState([]);
  const [filteredCheckpoints, setFilteredCheckpoints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchCheckpoints();
  }, []);

  const fetchCheckpoints = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching checkpoints...');
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/configuration/assigned-resources`, {
        method: 'POST',
        body: JSON.stringify({ scope: 'checkpoints' })
      });

      console.log('Checkpoint response status:', response.status);

      if (!response.ok) {
        const error = new Error('API Error');
        error.response = { status: response.status };
        throw error;
      }

      const data = await response.json();
      console.log('Checkpoint data received:', data);
      setCheckpoints(data.data || []);
      setFilteredCheckpoints(data.data || []);
    } catch (err) {
      console.error('Checkpoint fetch error:', err);
      const errorInfo = handleApiError(err);
      setError(errorInfo.error);
    } finally {
      setLoading(false);
    }
  };

  // Filter checkpoints based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCheckpoints(checkpoints);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = checkpoints.filter(checkpoint =>
      checkpoint.checkpoint_name.toLowerCase().includes(query) ||
      checkpoint.location_name.toLowerCase().includes(query) ||
      (checkpoint.checkpoint_type && checkpoint.checkpoint_type.toLowerCase().includes(query))
    );
    setFilteredCheckpoints(filtered);
  }, [searchQuery, checkpoints]);

  if (loading) {
    return <FullPageLoader message="Loading Checkpoints" />;
  }

  if (error) {
    return (
      <ErrorState
        title={error.title}
        message={error.message}
        icon={error.icon}
        statusCode={error.statusCode}
        onRetry={fetchCheckpoints}
      />
    );
  }

  // If no permission, don't render anything (card won't be shown in overview)
  if (!canViewCheckpointSettings) {
    console.log('No permission to view checkpoint settings');
    return null;
  }

  console.log('Checkpoint Settings - Loading:', loading, 'Error:', error, 'Checkpoints:', checkpoints.length);

  return (
    <div className="space-y-6">
      {/* Checkpoints Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-800">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Checkpoint List</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {searchQuery ? (
                    <span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredCheckpoints.length}</span> of {checkpoints.length} checkpoints
                    </span>
                  ) : (
                    <span><span className="font-semibold">{checkpoints.length}</span> total checkpoints</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, location, type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 text-sm transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Add Button */}
            {canAddCheckpoint && (
              <button className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Checkpoint
              </button>
            )}
          </div>
        </div>

        {checkpoints.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Checkpoints Found</h3>
            <p className="text-gray-500 dark:text-gray-400">No checkpoints are currently configured in the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Checkpoint Name</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredCheckpoints.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No checkpoints found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search</p>
                    </td>
                  </tr>
                ) : (
                  filteredCheckpoints.map((checkpoint) => (
                  <tr key={checkpoint.checkpoint_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white block">{checkpoint.checkpoint_name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Sequence: {checkpoint.sequence_order}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{checkpoint.location_name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{checkpoint.checkpoint_type || '-'}</span>
                    </td>
                    <td className="py-4 px-6">
                      {checkpoint.disabled ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400"></span>
                          Disabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCheckpoint(checkpoint);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          className="px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedCheckpoint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCheckpoint.checkpoint_name}</h3>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Checkpoint ID</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCheckpoint.checkpoint_id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-1">
                    {selectedCheckpoint.disabled ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                        Disabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        Active
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Location</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCheckpoint.location_name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Checkpoint Type</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCheckpoint.checkpoint_type || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Direction</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCheckpoint.direction || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Sequence Order</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCheckpoint.sequence_order}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Latitude</label>
                  <p className="text-sm font-mono font-medium text-gray-900 dark:text-white mt-1">{selectedCheckpoint.latitude || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Longitude</label>
                  <p className="text-sm font-mono font-medium text-gray-900 dark:text-white mt-1">{selectedCheckpoint.longitude || '-'}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckpointSettings;
