import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../utils/fetchWrapper';
import { handleApiError } from '../../utils/apiErrorHandler';
import { FullPageLoader } from '../common/Loader';
import ErrorState from '../common/ErrorState';

const CameraSettings = ({ hasPermissionForComponent, onNavigateToAddCamera }) => {
  // Permission checks
  const canViewCameraSettings = hasPermissionForComponent('Configurations', 'comp031', 'can_view');
  const canAddCamera = hasPermissionForComponent('Configurations', 'comp032', 'can_view');
  
  const [cameras, setCameras] = useState([]);
  const [filteredCameras, setFilteredCameras] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/configuration/assigned-resources`, {
        method: 'POST',
        body: JSON.stringify({ scope: 'camera' })
      });

      if (!response.ok) {
        const error = new Error('API Error');
        error.response = { status: response.status };
        throw error;
      }

      const data = await response.json();
      setCameras(data.data || []);
      setFilteredCameras(data.data || []);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.error);
    } finally {
      setLoading(false);
    }
  };

  // Filter cameras based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCameras(cameras);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = cameras.filter(camera =>
      camera.camera_name.toLowerCase().includes(query) ||
      camera.device_id.toLowerCase().includes(query) ||
      camera.location_name.toLowerCase().includes(query) ||
      camera.checkpoint_name.toLowerCase().includes(query)
    );
    setFilteredCameras(filtered);
  }, [searchQuery, cameras]);

  if (loading) {
    return <FullPageLoader message="Loading Cameras" />;
  }

  if (error) {
    return (
      <ErrorState
        title={error.title}
        message={error.message}
        icon={error.icon}
        statusCode={error.statusCode}
        onRetry={fetchCameras}
      />
    );
  }

  // If no permission, don't render anything (card won't be shown in overview)
  if (!canViewCameraSettings) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Cameras Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-800">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Camera List</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {searchQuery ? (
                    <span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">{filteredCameras.length}</span> of {cameras.length} cameras
                    </span>
                  ) : (
                    <span><span className="font-semibold">{cameras.length}</span> total cameras</span>
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
                placeholder="Search by name, device ID, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white placeholder-gray-400 text-sm transition-all shadow-sm"
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
            {canAddCamera && (
              <button 
                onClick={() => onNavigateToAddCamera(null)}
                className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Camera
              </button>
            )}
          </div>
        </div>

        {cameras.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Cameras Found</h3>
            <p className="text-gray-500 dark:text-gray-400">No cameras are currently configured in the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Camera Name</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Checkpoint</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredCameras.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No cameras found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search</p>
                    </td>
                  </tr>
                ) : (
                  filteredCameras.map((camera) => (
                  <tr key={camera.camera_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white block">{camera.camera_name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{camera.device_id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{camera.location_name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{camera.checkpoint_name}</span>
                    </td>
                    <td className="py-4 px-6">
                      {camera.disabled ? (
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
                            setSelectedCamera(camera);
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
                          onClick={() => onNavigateToAddCamera(camera)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
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
      {showDetailsModal && selectedCamera && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCamera.camera_name}</h3>
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
                  <label className="text-xs text-gray-500 dark:text-gray-400">Device ID</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCamera.device_id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-1">
                    {selectedCamera.disabled ? (
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
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCamera.location_name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Checkpoint</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCamera.checkpoint_name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Camera Type</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCamera.camera_type}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Camera Model</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCamera.camera_model}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">IP Address</label>
                  <p className="text-sm font-mono font-medium text-gray-900 dark:text-white mt-1">{selectedCamera.ip_address}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Username</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCamera.username}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">FPS</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCamera.fps}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Deployment Type</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCamera.deployment_type}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
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

export default CameraSettings;
