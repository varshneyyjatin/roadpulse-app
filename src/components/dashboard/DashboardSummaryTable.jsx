import { useState, useEffect, useMemo, useRef } from 'react';
import AddToWatchlistModal from './AddToWatchlistModal';
import FixVehicleNumberModal from './FixVehicleNumberModal';
import TimelineModal from './TimelineModal';
import RevisionInfoModal from './RevisionInfoModal';
import VehicleDetailsModal from '../reports/VehicleDetailsModal';
import Loader from '../common/Loader';

// Copyable Plate Number Component
const CopyablePlateNumber = ({ plateNumber, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(plateNumber);
      console.log('Copied:', plateNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = plateNumber;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        console.log('Copied using fallback:', plateNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err2) {
        console.error('Fallback copy failed:', err2);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleCopy}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`font-mono font-bold text-sm transition-all hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 ${className}`}
      >
        {plateNumber}
      </button>
      
      {/* Hover Tooltip - Click to copy */}
      {showTooltip && !copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap z-50 animate-fadeIn">
          Click to copy
        </span>
      )}
      
      {/* Success Message - Copied! */}
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap z-50 animate-fadeIn">
          Copied!
        </span>
      )}
    </div>
  );
};

// Custom Dropdown Component - Navbar Style
const CustomDropdown = ({ label, value, onChange, options, placeholder, icon, showSearch = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && buttonRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200"
      >
        {icon && (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        )}
        <span className={`text-sm flex-1 text-left ${value ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>
          {selectedOption?.label || placeholder}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="absolute z-50 left-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700">
          {/* Search Box - Show if enabled and more than 1 option */}
          {showSearch && options.length > 1 && (
            <div className="p-3 border-b border-gray-200 dark:border-slate-700">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="p-2 max-h-80 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition mb-1 relative ${value === option.value
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                >
                  {/* Left indicator bar for selected item */}
                  {value === option.value && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r-full"></div>
                  )}

                  <div className="flex items-center gap-3">
                    {/* Dot indicator */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${value === option.value
                      ? 'bg-blue-600 dark:bg-blue-400'
                      : 'bg-gray-300 dark:bg-slate-600'
                      }`}></div>

                    <span className={`text-sm flex-1 ${value === option.value ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                      {option.label}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No results found</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardSummaryTable = ({ data, appliedFilters, canAddToWatchlist = false, canFixVehicleNumber = false, canDownloadImage = false, onDataRefresh }) => {
  const vehicleLogs = data?.summary_data || [];

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('');
  const [showBlacklisted, setShowBlacklisted] = useState(false);
  const [showWhitelisted, setShowWhitelisted] = useState(false);

  // Vehicle Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState(null);

  // Watchlist Modal
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Fix Vehicle Number Modal
  const [showFixVehicleModal, setShowFixVehicleModal] = useState(false);
  const [selectedVehicleForFix, setSelectedVehicleForFix] = useState(null);

  // Timeline Modal
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedVehicleForTimeline, setSelectedVehicleForTimeline] = useState(null);

  // Revision Info Modal
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [selectedRevisionData, setSelectedRevisionData] = useState(null);

  // Image Modal States - Removed, using VehicleDetailsModal instead
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPlateImage, setIsPlateImage] = useState(false);

  // Get unique locations and checkpoints for filters
  const locationOptions = useMemo(() => {
    const unique = [...new Set(vehicleLogs.map(log => log.location_name))];
    return [
      { value: '', label: 'All Locations' },
      ...unique.filter(Boolean).map(loc => ({ value: loc, label: loc }))
    ];
  }, [vehicleLogs]);

  const checkpointOptions = useMemo(() => {
    // Filter checkpoints based on selected location
    const logsToFilter = selectedLocation
      ? vehicleLogs.filter(log => log.location_name === selectedLocation)
      : vehicleLogs;

    const unique = [...new Set(logsToFilter.map(log => log.checkpoint_name))];
    return [
      { value: '', label: 'All Checkpoints' },
      ...unique.filter(Boolean).map(cp => ({ value: cp, label: cp }))
    ];
  }, [vehicleLogs, selectedLocation]);

  const entriesOptions = [
    { value: 10, label: '10 entries' },
    { value: 25, label: '25 entries' },
    { value: 50, label: '50 entries' },
    { value: 100, label: '100 entries' }
  ];

  // Filter and search logic
  const filteredLogs = useMemo(() => {
    return vehicleLogs.filter(log => {
      const matchesSearch = log.plate_number?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = !selectedLocation || log.location_name === selectedLocation;
      const matchesCheckpoint = !selectedCheckpoint || log.checkpoint_name === selectedCheckpoint;
      
      // Blacklist/Whitelist filter logic
      let matchesListFilter = true;
      if (showBlacklisted && showWhitelisted) {
        // Show both blacklisted and whitelisted
        matchesListFilter = log.is_blacklisted || log.is_whitelisted;
      } else if (showBlacklisted) {
        // Show only blacklisted
        matchesListFilter = log.is_blacklisted;
      } else if (showWhitelisted) {
        // Show only whitelisted
        matchesListFilter = log.is_whitelisted;
      }
      // If neither is checked, show all
      
      return matchesSearch && matchesLocation && matchesCheckpoint && matchesListFilter;
    });
  }, [vehicleLogs, searchQuery, selectedLocation, selectedCheckpoint, showBlacklisted, showWhitelisted]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLocation, selectedCheckpoint, itemsPerPage, showBlacklisted, showWhitelisted]);

  // Reset checkpoint when location changes
  useEffect(() => {
    if (selectedLocation) {
      // Check if current checkpoint exists in new location
      const checkpointExistsInLocation = vehicleLogs.some(
        log => log.location_name === selectedLocation && log.checkpoint_name === selectedCheckpoint
      );
      if (!checkpointExistsInLocation) {
        setSelectedCheckpoint('');
      }
    }
  }, [selectedLocation, vehicleLogs, selectedCheckpoint]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date: dateStr, time: timeStr };
  };

  const getPlateImage = (log) => {
    // Direct URL from API response - check both possible field names
    const plateImageUrl = log.latest_data_number_plate_image || log.number_plate_image;
    
    if (plateImageUrl) {
      console.log('🖼️ Plate Image URL:', plateImageUrl);
      return plateImageUrl;
    }
    
    // Fallback to placeholder
    console.log('⚠️ No plate image URL found, using placeholder');
    return '/placeholder-plate.svg';
  };

  const getVehicleImage = (log) => {
    // Direct URL from API response - check both possible field names
    const vehicleImageUrl = log.latest_data_vehicle_image || log.vehicle_image;
    
    if (vehicleImageUrl) {
      console.log('🚗 Vehicle Image URL:', vehicleImageUrl);
      return vehicleImageUrl;
    }
    
    // Fallback to placeholder
    console.log('⚠️ No vehicle image URL found, using placeholder');
    return '/placeholder-vehicle.svg';
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedCheckpoint('');
    setShowBlacklisted(false);
    setShowWhitelisted(false);
  };

  const openDetailsModal = (vehicle) => {
    setSelectedVehicleDetails(vehicle);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedVehicleDetails(null);
  };

  const openImageModal = (imageSrc, isPlate = false) => {
    setSelectedImage(imageSrc);
    setIsPlateImage(isPlate);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
    setIsPlateImage(false);
  };



  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 transition-all duration-300">
      {/* Header with Title */}
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Summary Data</h2>
          <div className="flex flex-col sm:items-end gap-1">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Total Records: <span className="text-blue-600 dark:text-blue-400">{filteredLogs.length}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded"></div>
                <span>Blacklisted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded"></div>
                <span>Whitelisted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section - Only show if there's data */}
      {data?.summary_data && data.summary_data.length > 0 && (
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
        {/* All Filters in One Row */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="w-56">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
              Search Vehicle
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by plate number..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 text-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-slate-500"
              />
            </div>
          </div>

          {/* Location Filter */}
          <div className="w-56">
            <CustomDropdown
              label="Location"
              value={selectedLocation}
              onChange={setSelectedLocation}
              options={locationOptions}
              placeholder="All Locations"
              showSearch={true}
              icon={
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </>
              }
            />
          </div>

          {/* Checkpoint Filter */}
          <div className="w-56">
            <CustomDropdown
              label="Checkpoint"
              value={selectedCheckpoint}
              onChange={setSelectedCheckpoint}
              options={checkpointOptions}
              placeholder="All Checkpoints"
              showSearch={true}
              icon={
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </>
              }
            />
          </div>

          {/* Blacklist Filter */}
          <div className="w-56">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
              Blacklist Filter
            </label>
            <button
              type="button"
              onClick={() => setShowBlacklisted(!showBlacklisted)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all duration-200 ${
                showBlacklisted
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                  : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                showBlacklisted
                  ? 'border-red-500 bg-red-500'
                  : 'border-gray-300 dark:border-slate-600'
              }`}>
                {showBlacklisted && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm flex-1 text-left font-medium ${
                showBlacklisted
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                Show Blacklisted
              </span>
            </button>
          </div>

          {/* Whitelist Filter */}
          <div className="w-56">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
              Whitelist Filter
            </label>
            <button
              type="button"
              onClick={() => setShowWhitelisted(!showWhitelisted)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all duration-200 ${
                showWhitelisted
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                  : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                showWhitelisted
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 dark:border-slate-600'
              }`}>
                {showWhitelisted && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm flex-1 text-left font-medium ${
                showWhitelisted
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                Show Whitelisted
              </span>
            </button>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || selectedLocation || selectedCheckpoint || showBlacklisted || showWhitelisted) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium flex items-center gap-2 transition-colors rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>
      )}

      {/* Desktop Table View */}
      {data?.summary_data && data.summary_data.length > 0 && (
      <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-700/30">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Location</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Checkpoint</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Plate Number</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Number Plate</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Timeline</th>
              {/* Action column - only show if user has comp004 or comp005 */}
              {(canAddToWatchlist || canFixVehicleNumber) && (
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log, index) => {
              const { date, time } = formatTimestamp(log.timestamp);

              return (
                <tr key={log.log_id} className={`transition-colors ${
                  log.is_blacklisted
                    ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                    : log.is_whitelisted
                    ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  } ${index < currentLogs.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''}`}>
                  <td className="py-5 px-6">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{log.location_name}</span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{log.checkpoint_name}</span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="font-medium">{date}</div>
                      <div className="text-gray-600 dark:text-gray-400">{time}</div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <CopyablePlateNumber 
                      plateNumber={log.plate_number} 
                      className="text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="py-5 px-6">
                    <img
                      src={getPlateImage(log)}
                      alt="Plate"
                      onClick={() => openDetailsModal(log)}
                      onError={(e) => {
                        console.error('Failed to load plate image, using placeholder');
                        e.target.src = '/placeholder-plate.svg';
                      }}
                      crossOrigin="anonymous"
                      className="w-20 h-12 object-cover rounded border border-gray-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </td>
                  <td className="py-5 px-6">
                    {log.is_multiple_times ? (
                      <button
                        onClick={() => {
                          setSelectedVehicleForTimeline(log);
                          setShowTimelineModal(true);
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-800 transition-all flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        View
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                    )}
                  </td>
                  {/* Action cell - only show if user has comp004 or comp005 */}
                  {(canAddToWatchlist || canFixVehicleNumber) && (
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        {/* Fix Vehicle Number or Revision Info - comp005 */}
                        {canFixVehicleNumber && (
                          log.is_revised ? (
                            <div className="group relative">
                              <button
                                onClick={() => {
                                  setSelectedRevisionData(log.revised_data);
                                  setShowRevisionModal(true);
                                }}
                                className="p-2 text-blue-600 dark:text-blue-400"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              {/* Tooltip */}
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-xl group-hover:-translate-y-1">
                                <div className="flex items-center gap-2">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-medium">View Revision Info</span>
                                </div>
                                <div className="text-[10px] text-blue-100 mt-0.5">Number was corrected</div>
                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-blue-700"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="group relative">
                              <button
                                onClick={() => {
                                  console.log('Selected vehicle for fix:', log);
                                  console.log('log_id:', log.log_id);
                                  setSelectedVehicleForFix(log);
                                  setShowFixVehicleModal(true);
                                }}
                                className="p-2 text-blue-600 dark:text-blue-400"
                              >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {/* Tooltip */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-xl group-hover:-translate-y-1">
                              <div className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="font-medium">Fix Vehicle Number</span>
                              </div>
                              <div className="text-[10px] text-blue-100 mt-0.5">Correct misread plate numbers</div>
                              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-blue-700"></div>
                            </div>
                          </div>
                          )
                        )}
                        {/* Add to Watchlist - comp004 - Only for non-revised vehicles */}
                        {canAddToWatchlist && !log.is_revised && (
                          <div className="group relative">
                            <button
                              onClick={() => {
                                setSelectedVehicle(log);
                                setShowWatchlistModal(true);
                              }}
                              className="p-2 text-orange-600 dark:text-orange-400"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                            {/* Tooltip */}
                            <div className="absolute right-0 bottom-full mb-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-xl group-hover:-translate-y-1">
                              <div className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="font-medium">Add to Watchlist</span>
                              </div>
                              <div className="text-[10px] text-orange-100 mt-0.5">Monitor or restrict this vehicle</div>
                              <div className="absolute right-3 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-orange-700"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-3 space-y-3">
        {currentLogs.map((log) => {
          const { date, time } = formatTimestamp(log.timestamp);

          return (
            <div key={log.log_id} className={`rounded-lg p-3 border shadow-sm ${
              log.is_blacklisted
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : log.is_whitelist
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-white dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
              }`}>
              {/* Header with Plate Number and Action Buttons */}
              <div className="flex items-center justify-between mb-2">
                <CopyablePlateNumber 
                  plateNumber={log.plate_number} 
                  className="text-gray-900 dark:text-white"
                />
                <div className="flex items-center gap-2">
                  {!log.is_revised && (
                    <div className="group relative">
                      <button
                        onClick={() => {
                          setSelectedVehicleForFix(log);
                          setShowFixVehicleModal(true);
                        }}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all hover:scale-110"
                      >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute right-0 bottom-full mb-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-xl">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="font-medium">Fix Number</span>
                      </div>
                      <div className="absolute right-2 top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-blue-700"></div>
                    </div>
                    </div>
                  )}
                  {/* Add to Watchlist - Only for non-revised vehicles */}
                  {!log.is_revised && (
                    <div className="group relative">
                      <button
                        onClick={() => {
                          setSelectedVehicle(log);
                          setShowWatchlistModal(true);
                        }}
                        className="p-1.5 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      {/* Tooltip */}
                      <div className="absolute right-0 bottom-full mb-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-xl">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="font-medium">Add to Watchlist</span>
                        </div>
                        <div className="absolute right-2 top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-orange-700"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location & Checkpoint */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{log.location_name}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{log.checkpoint_name}</span>
              </div>

              {/* Number Plate Image */}
              <div className="mb-2">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Number Plate</p>
                <img
                  src={getPlateImage(log)}
                  alt="Plate"
                  onClick={() => openDetailsModal(log)}
                  onError={(e) => {
                    console.error('Failed to load plate image, using placeholder');
                    e.target.src = '/placeholder-plate.svg';
                  }}
                  crossOrigin="anonymous"
                  className="w-full h-20 object-cover rounded border border-gray-200 dark:border-slate-600 cursor-pointer hover:opacity-80 transition-opacity"
                />
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{date} at {time}</span>
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}

      {/* No Results */}
      {filteredLogs.length === 0 && (
        <div className="p-12 text-center">
          <div className="flex justify-center mb-6 opacity-40 grayscale">
            <Loader message="" showDots={false} staticMode={true} />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-semibold text-lg mb-2">
            {appliedFilters?.start_date || appliedFilters?.end_date
              ? 'No vehicle logs found for selected date range'
              : 'No vehicle logs found for today'
            }
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 max-w-md mx-auto">
            {appliedFilters?.start_date || appliedFilters?.end_date
              ? 'No data available for the selected time period. Try adjusting your date range or check other filters.'
              : 'Dashboard shows only today\'s data. Try adjusting your filters or check Reports section for historical data.'
            }
          </p>
        </div>
      )}

      {/* Pagination - Only show if there's data */}
      {filteredLogs.length > 0 && (
        <div className="p-4 md:p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm gap-3 mb-4">
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} entries
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm whitespace-nowrap">Show:</label>
              <div className="w-full sm:w-40">
                <CustomDropdown
                  value={itemsPerPage}
                  onChange={setItemsPerPage}
                  options={entriesOptions}
                  placeholder="25 entries"
                  showSearch={false}
                />
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Details Modal - Shows full card with download functionality */}
      <VehicleDetailsModal
        isOpen={detailsModalOpen}
        onClose={closeDetailsModal}
        vehicleData={selectedVehicleDetails}
        getPlateImage={getPlateImage}
        getVehicleImage={getVehicleImage}
        canDownload={canDownloadImage}
      />

      {/* Add to Watchlist Modal */}
      <AddToWatchlistModal
        isOpen={showWatchlistModal}
        onClose={() => setShowWatchlistModal(false)}
        vehicleNumber={selectedVehicle?.plate_number}
        vehicleId={selectedVehicle?.vehicle_id}
        isBlacklisted={selectedVehicle?.is_blacklisted}
        isWhitelisted={selectedVehicle?.is_whitelisted}
        onSuccess={(data) => {
          console.log('Added to watchlist:', data);
          // You can show a success toast here
        }}
      />

      {/* Fix Vehicle Number Modal */}
      <FixVehicleNumberModal
        isOpen={showFixVehicleModal}
        onClose={() => setShowFixVehicleModal(false)}
        currentPlateNumber={selectedVehicleForFix?.plate_number}
        logId={selectedVehicleForFix?.log_id}
        onSuccess={(data) => {
          console.log('Vehicle number updated:', data);
          // Refresh dashboard data
          if (onDataRefresh) {
            onDataRefresh();
          }
        }}
      />

      {/* Timeline Modal */}
      <TimelineModal
        isOpen={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        vehicleData={selectedVehicleForTimeline}
        getPlateImage={getPlateImage}
        getVehicleImage={getVehicleImage}
      />

      {/* Revision Info Modal */}
      <RevisionInfoModal
        isOpen={showRevisionModal}
        onClose={() => setShowRevisionModal(false)}
        revisionData={selectedRevisionData}
      />
    </div>
  );
};

export default DashboardSummaryTable;
