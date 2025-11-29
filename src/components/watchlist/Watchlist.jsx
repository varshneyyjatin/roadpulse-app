import { useState, useEffect } from 'react';
import { useAccessControl } from '../../contexts/AccessControl';
import PageHeader from '../common/PageHeader';
import ErrorState from '../common/ErrorState';
import AddToWatchlistModal from '../dashboard/AddToWatchlistModal';
import { FullPageLoader } from '../common/Loader';
import { handleApiError } from '../../utils/apiErrorHandler';
import CopyButton from '../common/CopyButton';

const Watchlist = () => {
  const { hasPermissionForComponent } = useAccessControl();
  
  // Permission checks
  const canAddVehicle = hasPermissionForComponent('Watchlist', 'comp021', 'can_view');
  const canUpdateVehicle = hasPermissionForComponent('Watchlist', 'comp022', 'can_view');
  
  const [watchlistData, setWatchlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchWatchlistData();
  }, []);

  const fetchWatchlistData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/watchlist/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const error = new Error('API Error');
        error.response = { 
          status: response.status,
          data: errorData
        };
        throw error;
      }

      const result = await response.json();
      console.log('Watchlist API Response:', result);
      
      // Handle different response formats
      let data = [];
      if (Array.isArray(result)) {
        data = result;
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.watchlist && Array.isArray(result.watchlist)) {
        data = result.watchlist;
      }
      
      setWatchlistData(data);
    } catch (err) {
      console.error('Watchlist fetch error:', err);
      const errorInfo = handleApiError(err);
      setError(errorInfo.error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dateFormatted} ${timeFormatted}`;
  };

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getLatestOperation = (operationData) => {
    if (!operationData || operationData.length === 0) return null;
    return operationData[operationData.length - 1];
  };

  const getStatusBadge = (entry) => {
    if (entry.is_blacklisted) {
      return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded">Blacklisted</span>;
    }
    if (entry.is_whitelisted) {
      return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded">Whitelisted</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded">Unknown</span>;
  };

  return (
    <div className="bg-white dark:bg-transparent min-h-screen transition-colors duration-300">
      
      <PageHeader
        title="Watchlist Management"
        description="Monitor and manage watchlisted vehicles with real-time alerts and comprehensive tracking"
        icon={
          <svg className="w-7 h-7 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Loading State */}
        {loading && <FullPageLoader message="Loading Watchlist..." />}

        {/* Error State */}
        {error && (
          <ErrorState
            title={error.title}
            message={error.message}
            icon={error.icon}
            statusCode={error.statusCode}
            onRetry={fetchWatchlistData}
          />
        )}

        {/* Watchlist Table */}
        {!loading && !error && watchlistData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                Watchlist Entries ({watchlistData.length})
              </h2>
              {canAddVehicle && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Vehicle
                </button>
              )}
            </div>

            {/* Desktop Table - Classy Design */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800/50 border-b-2 border-gray-200 dark:border-slate-700">
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-12"></th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Vehicle</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Last Update</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Updated By</th>
                    <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {watchlistData.map((entry, index) => {
                    const latestOp = getLatestOperation(entry.operation_data);
                    const isExpanded = expandedRows.has(entry.id);
                    const hasHistory = entry.operation_data && entry.operation_data.length > 1;
                    
                    return (
                      <>
                        <tr key={entry.id} className="group hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent dark:hover:from-slate-700/30 dark:hover:to-transparent transition-all duration-200">
                          <td className="py-5 px-6">
                            {hasHistory && (
                              <button
                                onClick={() => toggleRow(entry.id)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-slate-700 transition-all"
                              >
                                <svg 
                                  className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            )}
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-2">
                              <CopyButton 
                                text={entry.plate_number} 
                                className="text-base font-bold text-gray-900 dark:text-white font-mono tracking-wide"
                              />
                              {hasHistory && (
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full">
                                  {entry.operation_data?.length}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg">
                              {entry.is_blacklisted ? (
                                <>
                                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                                  <span className="text-sm font-semibold text-red-700 dark:text-red-400">Blacklisted</span>
                                </>
                              ) : entry.is_whitelisted ? (
                                <>
                                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">Whitelisted</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Removed</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{entry.reason || '-'}</span>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(latestOp?.added_date || entry.updated_at || entry.created_at)}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Last modified</span>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{latestOp?.added_by || '-'}</span>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center justify-center">
                              {canUpdateVehicle ? (
                                <button
                                  onClick={() => {
                                    setSelectedVehicle({
                                      ...entry,
                                      vehicle_id: entry.vehicle_id
                                    });
                                    setShowAddModal(true);
                                  }}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Update
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500">No permission</span>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded History Row - Simple Table */}
                        {isExpanded && hasHistory && (
                          <tr className="bg-gray-50 dark:bg-slate-800/30">
                            <td colSpan="7" className="p-0">
                              <div className="px-6 py-4">
                                <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">#</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Action</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Reason</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Updated By</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date & Time</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                      {entry.operation_data.slice().reverse().map((op, opIndex) => {
                                        const isLatest = opIndex === 0;
                                        return (
                                          <tr 
                                            key={`${entry.id}-op-${op.operation_number || opIndex}`}
                                            className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${
                                              isLatest ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                          >
                                            <td className="py-3 px-4">
                                              <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded ${
                                                isLatest 
                                                  ? 'bg-blue-600 text-white' 
                                                  : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                                              }`}>
                                                {op.operation_number}
                                              </span>
                                            </td>
                                            <td className="py-3 px-4">
                                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                op.action === 'added' 
                                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                              }`}>
                                                {op.action === 'added' ? 'Added' : 'Updated'}
                                              </span>
                                            </td>
                                            <td className="py-3 px-4">
                                              {op.is_blacklisted && (
                                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                                                  Blacklisted
                                                </span>
                                              )}
                                              {op.is_whitelisted && (
                                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                                                  Whitelisted
                                                </span>
                                              )}
                                              {!op.is_blacklisted && !op.is_whitelisted && (
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                                                  Removed
                                                </span>
                                              )}
                                            </td>
                                            <td className="py-3 px-4">
                                              <span className="text-sm text-gray-900 dark:text-white">{op.reason}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                              <span className="text-sm text-gray-700 dark:text-gray-300">{op.added_by}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                              <span className="text-sm text-gray-700 dark:text-gray-300">{formatDateTime(op.added_date)}</span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-3 space-y-3">
              {watchlistData.map((entry) => {
                const latestOp = getLatestOperation(entry.operation_data);
                const isExpanded = expandedRows.has(entry.id);
                const hasHistory = entry.operation_data && entry.operation_data.length > 1;
                
                return (
                  <div key={entry.id} className="bg-white dark:bg-slate-700/50 rounded-lg p-4 border border-gray-200 dark:border-slate-600 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <CopyButton 
                        text={entry.plate_number} 
                        className="text-sm font-bold text-gray-900 dark:text-white font-mono"
                      />
                      {getStatusBadge(entry)}
                    </div>
                    
                    <div className="space-y-2 text-xs mb-3">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Reason: </span>
                        <span className="text-gray-900 dark:text-white">{entry.reason || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Last Updated: </span>
                        <span className="text-gray-900 dark:text-white">{formatDate(entry.updated_at || entry.created_at)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Updated By: </span>
                        <span className="text-gray-900 dark:text-white">{latestOp?.added_by || '-'}</span>
                      </div>
                      <div>
                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
                          {entry.operation_data?.length || 0} {entry.operation_data?.length === 1 ? 'Operation' : 'Operations'}
                        </span>
                      </div>
                    </div>

                    {/* History Toggle Button */}
                    {hasHistory && (
                      <>
                        <button
                          onClick={() => toggleRow(entry.id)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all border border-gray-300 dark:border-slate-600 mt-2"
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                          {isExpanded ? 'Hide History' : 'View History'}
                        </button>

                        {/* Expanded History - Clean & Minimal */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 space-y-2">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                              Operation History ({entry.operation_data.length})
                            </div>
                            {entry.operation_data.slice().reverse().map((op, opIndex) => {
                              const isLatest = opIndex === 0;
                              return (
                                <div 
                                  key={opIndex} 
                                  className={`p-2.5 rounded-lg border ${
                                    isLatest 
                                      ? 'bg-gray-100 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600' 
                                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                                      isLatest 
                                        ? 'bg-gray-700 dark:bg-slate-600 text-white' 
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                                    }`}>
                                      #{op.operation_number}
                                    </span>
                                    {isLatest && (
                                      <span className="px-1.5 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                                        Current
                                      </span>
                                    )}
                                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                                      op.action === 'added' 
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    }`}>
                                      {op.action === 'added' ? 'Added' : 'Updated'}
                                    </span>
                                    {op.is_blacklisted && (
                                      <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                                        Blacklisted
                                      </span>
                                    )}
                                    {op.is_whitelisted && (
                                      <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                                        Whitelisted
                                      </span>
                                    )}
                                    {!op.is_blacklisted && !op.is_whitelisted && (
                                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                                        Removed
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-900 dark:text-white mb-1.5">{op.reason}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{op.added_by}</span>
                                    <span>•</span>
                                    <span>{formatDateTime(op.added_date)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}

                    {/* Update Button */}
                    {canUpdateVehicle && (
                      <button
                        onClick={() => {
                          setSelectedVehicle({
                            ...entry,
                            vehicle_id: entry.vehicle_id
                          });
                          setShowAddModal(true);
                        }}
                        className="w-full mt-3 px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-800 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Update Status
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && watchlistData.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <svg className="w-20 h-20 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Watchlist Entries</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                There are currently no vehicles in the watchlist
              </p>
              {canAddVehicle && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold flex items-center gap-2 hover:shadow-lg hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Vehicle
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Update Watchlist Modal */}
      <AddToWatchlistModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedVehicle(null);
        }}
        vehicleNumber={selectedVehicle?.plate_number || null}
        vehicleId={selectedVehicle?.vehicle_id}
        isBlacklisted={selectedVehicle?.is_blacklisted || false}
        isWhitelisted={selectedVehicle?.is_whitelisted || false}
        onSuccess={() => {
          fetchWatchlistData();
          setSelectedVehicle(null);
        }}
      />
    </div>
  );
};

export default Watchlist;