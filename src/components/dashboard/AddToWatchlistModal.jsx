import { useState, useRef, useEffect } from 'react';
import { handleApiError } from '../../utils/apiErrorHandler';
import { fetchWithAuth } from '../../utils/fetchWrapper';

const AddToWatchlistModal = ({ isOpen, onClose, vehicleNumber, vehicleId, isBlacklisted: alreadyBlacklisted, isWhitelisted: alreadyWhitelisted, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [manualVehicleNumber, setManualVehicleNumber] = useState('');
  const [showMoveForm, setShowMoveForm] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  
  const isManualEntry = vehicleNumber === null || vehicleNumber === undefined;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  if (!isOpen) return null;

  const reasonOptions = [
    { value: 'custom', label: '+ Add Your Own Reason', isCustom: true },
    { value: 'Suspicious Activity', label: 'Suspicious Activity' },
    { value: 'Security Threat', label: 'Security Threat' },
    { value: 'Repeated Violations', label: 'Repeated Violations' },
    { value: 'Stolen Vehicle', label: 'Stolen Vehicle' },
    { value: 'VIP Vehicle', label: 'VIP Vehicle' },
    { value: 'Authorized Personnel', label: 'Authorized Personnel' },
    { value: 'Frequent Visitor', label: 'Frequent Visitor' },
  ];

  const handleReasonChange = (value) => {
    if (value === 'custom') {
      setShowCustomInput(true);
      setReason('');
    } else {
      setShowCustomInput(false);
      setReason(value);
      setCustomReason('');
    }
  };

  const handleToggle = (type) => {
    if (type === 'blacklist') {
      setIsBlacklisted(!isBlacklisted);
      if (!isBlacklisted) setIsWhitelisted(false);
    } else {
      setIsWhitelisted(!isWhitelisted);
      if (!isWhitelisted) setIsBlacklisted(false);
    }
  };

  const handleSubmit = async () => {
    const finalReason = showCustomInput ? customReason : reason;
    const finalVehicleNumber = isManualEntry 
      ? manualVehicleNumber.replace(/\s+/g, '').toUpperCase() 
      : vehicleNumber;
    
    // Validation for manual entry
    if (isManualEntry && !manualVehicleNumber.trim()) {
      setError('Please enter a vehicle number');
      return;
    }
    
    // If removing from watchlist (both flags false), don't require reason
    const isRemoving = (alreadyBlacklisted || alreadyWhitelisted) && !isBlacklisted && !isWhitelisted;
    
    // Require reason only if not removing
    if (!isRemoving && !finalReason) {
      setError('Please provide a reason');
      return;
    }

    // Require at least one flag to be true if not removing
    if (!isRemoving && !isBlacklisted && !isWhitelisted) {
      setError('Please select either Blacklist or Whitelist');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const companyId = 1;

      const requestBody = {
        vehicle_type: 'Unknown',
        company_id: companyId,
        reason: isRemoving ? 'Removed from watchlist' : finalReason,
        is_blacklisted: isBlacklisted,
        is_whitelisted: isWhitelisted
      };

      if (vehicleId) {
        requestBody.vehicle_id = vehicleId;
      } else {
        requestBody.plate_number = finalVehicleNumber;
      }

      console.log('🚀 Watchlist API Request:', requestBody);

      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/watchlist/`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
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

      const data = await response.json();
      console.log('✅ Watchlist API Response:', data);
      
      setSuccess(true);
      if (onSuccess) onSuccess(data);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 modal-backdrop z-[60] flex items-center justify-center p-4 overflow-y-auto" onClick={() => { setDropdownOpen(false); onClose(); }}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 w-full max-w-md my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-b border-gray-200 dark:border-slate-600 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {success ? '✓ Success' : 'Manage Watchlist'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1 hover:bg-white/50 dark:hover:bg-slate-600/50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 rounded-b-2xl">
          {success ? (
            <div className="text-center py-10 animate-fadeIn">
              <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-700/50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {(alreadyBlacklisted || alreadyWhitelisted) && !isBlacklisted && !isWhitelisted 
                  ? 'Removed Successfully' 
                  : (alreadyBlacklisted || alreadyWhitelisted) 
                    ? 'Updated Successfully' 
                    : 'Added Successfully'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Vehicle <span className="font-bold text-gray-900 dark:text-white">{isManualEntry ? manualVehicleNumber : vehicleNumber}</span> has been 
                {(alreadyBlacklisted || alreadyWhitelisted) && !isBlacklisted && !isWhitelisted 
                  ? ' removed from the watchlist' 
                  : (alreadyBlacklisted || alreadyWhitelisted) 
                    ? ` moved to ${isBlacklisted ? 'blacklist' : 'whitelist'}` 
                    : ' added to the watchlist'}.
              </p>
            </div>
          ) : (alreadyBlacklisted || alreadyWhitelisted) ? (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1.5 uppercase tracking-wide">Vehicle Number</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-200">{vehicleNumber}</p>
              </div>

              <div className={`p-5 rounded-xl border-2 shadow-sm ${
                alreadyBlacklisted 
                  ? 'bg-gradient-to-br from-red-50 to-red-100/30 dark:from-red-900/10 dark:to-red-800/5 border-red-200 dark:border-red-800/40' 
                  : 'bg-gradient-to-br from-green-50 to-green-100/30 dark:from-green-900/10 dark:to-green-800/5 border-green-200 dark:border-green-800/40'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    alreadyBlacklisted 
                      ? 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/20' 
                      : 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/20'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      alreadyBlacklisted ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {alreadyBlacklisted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-base font-bold mb-1 ${
                      alreadyBlacklisted ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'
                    }`}>
                      Currently {alreadyBlacklisted ? 'Blacklisted' : 'Whitelisted'}
                    </h3>
                    <p className={`text-sm leading-relaxed ${
                      alreadyBlacklisted ? 'text-red-700/90 dark:text-red-400/90' : 'text-green-700/90 dark:text-green-400/90'
                    }`}>
                      Choose an action below to manage this vehicle.
                    </p>
                  </div>
                </div>
              </div>

              {showMoveForm ? (
                <>
                  <div className="relative z-50" ref={dropdownRef}>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Moving <span className="text-red-500">*</span>
                    </label>
                    <button
                      ref={buttonRef}
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-700 border rounded-lg text-sm transition-all ${
                        dropdownOpen 
                          ? 'border-orange-500 ring-2 ring-orange-500/20' 
                          : 'border-gray-300 dark:border-slate-600 hover:border-orange-400 dark:hover:border-orange-500'
                      }`}
                    >
                      <span className={reason || showCustomInput ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}>
                        {showCustomInput ? '+ Add Your Own Reason' : (reason || 'Select a reason...')}
                      </span>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 max-h-80 overflow-y-auto animate-fadeIn custom-scrollbar">
                        <div className="p-2">
                          {reasonOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                handleReasonChange(opt.value);
                                setDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-all mb-1 ${
                                (showCustomInput && opt.value === 'custom') || (!showCustomInput && reason === opt.value)
                                  ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                                  : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                              }`}
                            >
                              <span className={`text-sm ${
                                opt.isCustom 
                                  ? 'font-bold text-orange-600 dark:text-orange-400' 
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {opt.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {showCustomInput && (
                    <div className="animate-fadeIn">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Enter Your Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Type your custom reason here..."
                        rows="3"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white text-sm resize-none transition-all"
                      />
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowMoveForm(false);
                        setReason('');
                        setCustomReason('');
                        setShowCustomInput(false);
                        setError(null);
                      }}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Moving...
                        </>
                      ) : (
                        `Move to ${isBlacklisted ? 'Blacklist' : 'Whitelist'}`
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {error && (
                    <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-l-4 border-red-500 dark:border-red-600 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowMoveForm(true);
                        setIsBlacklisted(!alreadyBlacklisted);
                        setIsWhitelisted(!alreadyWhitelisted);
                        setReason('');
                        setCustomReason('');
                        setShowCustomInput(false);
                        setError(null);
                      }}
                      disabled={loading}
                      className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md ${
                        alreadyBlacklisted
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                          : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Move to {alreadyBlacklisted ? 'Whitelist' : 'Blacklist'}
                    </button>

                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Removing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove from Watchlist
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {isManualEntry ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualVehicleNumber}
                    onChange={(e) => setManualVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="Enter vehicle number (e.g., DL 3S AS 6754)"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white text-sm transition-all hover:border-orange-400 dark:hover:border-orange-500 uppercase"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Spaces will be automatically removed (e.g., "DL 3S AS 6754" → "DL3SAS6754")
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Vehicle Number</p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-300">{vehicleNumber}</p>
                </div>
              )}

              <div className="relative z-50" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-700 border rounded-lg text-sm transition-all ${
                    dropdownOpen 
                      ? 'border-orange-500 ring-2 ring-orange-500/20' 
                      : 'border-gray-300 dark:border-slate-600 hover:border-orange-400 dark:hover:border-orange-500'
                  }`}
                >
                  <span className={reason || showCustomInput ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}>
                    {showCustomInput ? '+ Add Your Own Reason' : (reason || 'Select a reason...')}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 max-h-80 overflow-y-auto animate-fadeIn custom-scrollbar">
                    <div className="p-2">
                      {reasonOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            handleReasonChange(opt.value);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all mb-1 relative group ${
                            (showCustomInput && opt.value === 'custom') || (!showCustomInput && reason === opt.value)
                              ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                              : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                          } ${opt.isCustom ? 'border-b border-gray-200 dark:border-slate-700 mb-2' : ''}`}
                        >
                          {((showCustomInput && opt.value === 'custom') || (!showCustomInput && reason === opt.value)) && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-600 dark:bg-orange-400 rounded-r-full"></div>
                          )}
                          
                          <div className="flex items-center gap-3">
                            {opt.isCustom ? (
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                            ) : (
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                (!showCustomInput && reason === opt.value)
                                  ? 'bg-orange-600 dark:bg-orange-400' 
                                  : 'bg-gray-300 dark:bg-slate-600'
                              }`}></div>
                            )}
                            
                            <span className={`text-sm flex-1 ${
                              opt.isCustom 
                                ? 'font-bold text-orange-600 dark:text-orange-400' 
                                : ((!showCustomInput && reason === opt.value) 
                                  ? 'font-semibold text-orange-600 dark:text-orange-400' 
                                  : 'text-gray-900 dark:text-white')
                            }`}>
                              {opt.label}
                            </span>

                            {((showCustomInput && opt.value === 'custom') || (!showCustomInput && reason === opt.value)) && (
                              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {showCustomInput && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Enter Your Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Type your custom reason here..."
                    rows="3"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white text-sm resize-none transition-all hover:border-orange-400 dark:hover:border-orange-500"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="group relative">
                  <div className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border transition-all ${
                    isBlacklisted 
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-200 dark:border-slate-600 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50/50 dark:hover:bg-red-900/10'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        isBlacklisted 
                          ? 'bg-red-200 dark:bg-red-900/50 scale-110' 
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Blacklist</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Block this vehicle from entry</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle('blacklist')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 hover:scale-110 ${
                        isBlacklisted ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600 hover:bg-red-400'
                      }`}
                      title={isBlacklisted ? 'Remove from Blacklist' : 'Add to Blacklist'}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                        isBlacklisted ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="group relative">
                  <div className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border transition-all ${
                    isWhitelisted 
                      ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-slate-600 hover:border-green-200 dark:hover:border-green-800 hover:bg-green-50/50 dark:hover:bg-green-900/10'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        isWhitelisted 
                          ? 'bg-green-200 dark:bg-green-900/50 scale-110' 
                          : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Whitelist</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Allow priority access for this vehicle</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle('whitelist')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 hover:scale-110 ${
                        isWhitelisted ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600 hover:bg-green-400'
                      }`}
                      title={isWhitelisted ? 'Remove from Whitelist' : 'Add to Whitelist'}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                        isWhitelisted ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Adding...
                    </>
                  ) : (
                    'Add to Watchlist'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToWatchlistModal;
