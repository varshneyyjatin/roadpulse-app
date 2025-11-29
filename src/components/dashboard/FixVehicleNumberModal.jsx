import { useState, useRef, useEffect } from 'react';

const FixVehicleNumberModal = ({ isOpen, onClose, currentPlateNumber, logId, onSuccess }) => {
  const [newVehicleNumber, setNewVehicleNumber] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewVehicleNumber('');
      setReason('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const reasonOptions = [
    { value: 'Misread Issue', label: 'Misread Issue' },
    { value: 'Damaged Plate', label: 'Damaged Plate' },
    { value: 'Poor Lighting', label: 'Poor Lighting' },
    { value: 'Camera Angle Issue', label: 'Camera Angle Issue' },
  ];

  const handleReasonChange = (value) => {
    setReason(value);
  };

  const handleSubmit = async () => {
    const finalReason = reason;
    // Remove all spaces and convert to uppercase
    const finalVehicleNumber = newVehicleNumber.replace(/\s+/g, '').toUpperCase();

    if (!finalVehicleNumber.trim()) {
      setError('Please enter a vehicle number');
      return;
    }

    if (!finalReason) {
      setError('Please provide a reason');
      return;
    }

    if (!logId) {
      setError('Record ID is missing. Please try again.');
      console.error('logId is missing:', { logId, currentPlateNumber });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');

      const requestData = {
        record_id: logId,
        old_value: currentPlateNumber,
        new_value: finalVehicleNumber,
        change_reason: finalReason
      };

      console.log('Fix Vehicle Number Request:', requestData);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/fix-vehicle-number`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        // Handle different error formats from backend
        let errorMessage = 'Failed to update vehicle number';
        
        if (errorData) {
          // Check for different error message formats
          if (errorData.detail) {
            // Handle both string and array detail formats
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map(err => err.msg || err).join(', ');
            } else if (typeof errorData.detail === 'object') {
              errorMessage = JSON.stringify(errorData.detail);
            } else {
              errorMessage = errorData.detail;
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else {
            // If nothing matches, stringify the whole error
            errorMessage = JSON.stringify(errorData);
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Show success message
      setSuccess(true);
      if (onSuccess) onSuccess({
        oldPlateNumber: currentPlateNumber,
        newPlateNumber: finalVehicleNumber,
        reason: finalReason,
        data
      });

      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Fix Vehicle Number Error:', err);
      setError(err.message || 'Failed to update vehicle number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 modal-backdrop z-[60] flex items-start justify-center p-4 pt-16 overflow-y-auto" onClick={() => { setDropdownOpen(false); onClose(); }}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 w-full max-w-md mb-20" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-b border-gray-200 dark:border-slate-600 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {success ? '✓ Success' : 'Fix Vehicle Number'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1 hover:bg-white/50 dark:hover:bg-slate-600/50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 rounded-b-2xl">
          {/* Success Message */}
          {success ? (
            <div className="text-center py-10 animate-fadeIn">
              <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-700/50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Updated Successfully
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Vehicle number has been updated from <span className="font-bold text-gray-900 dark:text-white">{currentPlateNumber}</span> to <span className="font-bold text-gray-900 dark:text-white">{newVehicleNumber.replace(/\s+/g, '').toUpperCase()}</span>.
              </p>
            </div>
          ) : (
            <>
              {/* Current Vehicle Number Display */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1.5 uppercase tracking-wide">Current Plate Number</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-200">{currentPlateNumber}</p>
              </div>

              {/* New Vehicle Number Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Change To <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newVehicleNumber}
                  onChange={(e) => setNewVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="Enter corrected vehicle number"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-sm transition-all hover:border-blue-400 dark:hover:border-blue-500 uppercase"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Spaces will be automatically removed and letters will be capitalized
                </p>
              </div>

              {/* Custom Reason Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-700 border rounded-lg text-sm transition-all ${dropdownOpen
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                >
                  <span className={reason ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}>
                    {reason || 'Select a reason...'}
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

                {/* Dropdown Menu - Opens Outside Modal */}
                {dropdownOpen && (
                  <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 max-h-72 overflow-y-auto animate-fadeIn custom-scrollbar">
                    <div className="p-2">
                      {reasonOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            handleReasonChange(opt.value);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all relative group mb-1.5 ${reason === opt.value
                              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                              : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                        >
                          {/* Selected indicator */}
                          {reason === opt.value && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r-full"></div>
                          )}

                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${reason === opt.value
                                ? 'bg-blue-600 dark:bg-blue-400'
                                : 'bg-gray-300 dark:bg-slate-600'
                              }`}></div>

                            <span className={`text-sm flex-1 ${reason === opt.value
                                ? 'font-semibold text-blue-600 dark:text-blue-400'
                                : 'text-gray-900 dark:text-white'
                              }`}>
                              {opt.label}
                            </span>

                            {/* Checkmark for selected */}
                            {reason === opt.value && (
                              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              {/* Error Message */}
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

              {/* Buttons */}
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
                  className="flex-1 px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Vehicle Number'
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

export default FixVehicleNumberModal;
