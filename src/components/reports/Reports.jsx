import { useState, useEffect, useRef, useMemo } from 'react';
import { useAccessControl } from '../../contexts/AccessControl';
import PageHeader from '../common/PageHeader';
import VehicleDetailsModal from './VehicleDetailsModal';
import { exportToExcel } from '../../utils/excelExport';
import Loader from '../common/Loader';
import { handleApiError } from '../../utils/apiErrorHandler';
import { fetchWithAuth } from '../../utils/fetchWrapper';
import CopyButton from '../common/CopyButton';

// Custom Date Picker Component
const CustomDatePicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && buttonRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Select date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handleDateSelect = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    // Use local date formatting to avoid timezone issues
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const isSelectedDate = (day) => {
    if (!value) return false;
    // Parse the date string directly to avoid timezone issues
    const [selectedYear, selectedMonth, selectedDay] = value.split('-').map(Number);
    return selectedDay === day &&
      (selectedMonth - 1) === month &&
      selectedYear === year;
  };

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200"
      >
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={`text-sm flex-1 text-left ${value ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>
          {formatDate(value)}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="absolute z-50 left-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {monthNames[month]} {year}
            </div>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isSelected = isSelectedDate(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Dropdown Component - Same as Dashboard
const CustomDropdown = ({ label, value, onChange, options, placeholder, icon, showSearch = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownSearchQuery, setDropdownSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && buttonRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
        setDropdownSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(dropdownSearchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
          {/* Search Box */}
          {showSearch && options.length > 1 && (
            <div className="p-3 border-b border-gray-200 dark:border-slate-700">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={dropdownSearchQuery}
                  onChange={(e) => setDropdownSearchQuery(e.target.value)}
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
                    setDropdownSearchQuery('');
                  }}
                  className="relative w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {value === option.value && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r-full"></div>
                  )}

                  <div className="flex items-center gap-3">
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

const Reports = () => {
  const { hasPermissionForComponent, accessControl } = useAccessControl();

  // Permission checks - if no components assigned to Reports tab, all permissions are granted
  const canViewTable = hasPermissionForComponent('Reports', 'comp011', 'can_view');
  const canExportExcel = hasPermissionForComponent('Reports', 'comp013', 'can_view');
  const canDownloadImage = hasPermissionForComponent('Reports', 'comp012', 'can_view');

  // Debug permissions
  console.log('Reports Permissions:', { canViewTable, canExportExcel, canDownloadImage });

  // Filter States
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerError, setDatePickerError] = useState(null);
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  
  const datePickerRef = useRef(null);
  const dateButtonRef = useRef(null);

  // Report Data States
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search and Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Vehicle Details Modal States
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Export Loading States
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0, percentage: 0, stage: '', elapsedTime: 0 });

  // Get locations from AccessControl
  const locationOptions = [
    { value: '', label: 'All Locations' },
    ...(accessControl?.locations || []).map(loc => ({
      value: loc.location_id,
      label: loc.location_name
    }))
  ];

  // Get checkpoints based on selected location
  const checkpointOptions = [
    { value: '', label: 'All Checkpoints' },
    ...(selectedLocation
      ? // If location selected, show only that location's checkpoints
      (accessControl?.locations?.find(loc => loc.location_id === selectedLocation)?.checkpoints || []).map(cp => ({
        value: cp.checkpoint_id,
        label: cp.checkpoint_name
      }))
      : // If no location selected, show all checkpoints from all locations
      (accessControl?.locations || []).flatMap(loc =>
        (loc.checkpoints || []).map(cp => ({
          value: cp.checkpoint_id,
          label: cp.checkpoint_name
        }))
      )
    )
  ];

  // Click outside handler for date picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDatePicker && datePickerRef.current && dateButtonRef.current &&
        !datePickerRef.current.contains(event.target) &&
        !dateButtonRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  // Reset checkpoint when location changes
  useEffect(() => {
    if (selectedLocation) {
      const locationHasCheckpoint = accessControl?.locations
        ?.find(loc => loc.location_id === selectedLocation)
        ?.checkpoints?.some(cp => cp.checkpoint_id === selectedCheckpoint);

      if (!locationHasCheckpoint) {
        setSelectedCheckpoint('');
      }
    }
  }, [selectedLocation, accessControl, selectedCheckpoint]);

  const getFilterDisplayText = () => {
    if (!startDate && !endDate) {
      return 'Select Date Range';
    }

    if (startDate && endDate) {
      const startFormatted = new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const endFormatted = new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${startFormatted} - ${endFormatted}`;
    } else if (startDate) {
      const startFormatted = new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return `From ${startFormatted}`;
    }

    return 'Select Date Range';
  };

  const handleGenerateReport = async () => {
    console.log('Generate Report clicked', { selectedLocation, selectedCheckpoint, plateNumber, startDate, endDate, isBlacklisted, isWhitelisted });
    
    // Validations - both dates required if any date is selected
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setError({ title: 'Validation Error', message: 'Please select both start and end dates' });
      return;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      // Check if end date is before start date
      if (start > end) {
        setError({ title: 'Validation Error', message: 'Start date must be before or equal to end date' });
        return;
      }

      // Check if end date is in future
      if (end > today) {
        setError({ title: 'Validation Error', message: 'End date cannot be in the future' });
        return;
      }

      // Check if date range exceeds 90 days
      const diffTime = end - start;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays >= 90) {
        setError({ title: 'Validation Error', message: 'Date range cannot exceed 90 days' });
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare request body
      const requestBody = {
        scope: 'report',
        location_ids: selectedLocation ? [selectedLocation] : null,
        checkpoint_ids: selectedCheckpoint ? [selectedCheckpoint] : null,
        plate_number: plateNumber.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null
      };
      
      // Only add blacklist/whitelist if checked
      if (isBlacklisted) {
        requestBody.is_blacklisted = true;
      }
      if (isWhitelisted) {
        requestBody.is_whitelisted = true;
      }

      console.log('API Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/dashboard/vehicle-logs`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = new Error('API Error');
        error.response = { status: response.status };
        throw error;
      }

      const data = await response.json();
      console.log('Report data received:', data);
      console.log('Summary data length:', data?.summary_data?.length);
      console.log('Can view table:', canViewTable);
      setReportData(data);
      setError(null);
    } catch (err) {
      console.error('Error generating report:', err);
      const errorInfo = handleApiError(err);
      setError(errorInfo.error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredLogs = useMemo(() => {
    if (!reportData?.summary_data) return [];

    return reportData.summary_data.filter(log => {
      const matchesSearch = log.plate_number?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [reportData, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  // Image helper functions
  const getPlateImage = (log) => {
    // Direct URL from API response - check both possible field names
    const plateImageUrl = log.latest_data_number_plate_image || log.number_plate_image;
    
    if (plateImageUrl) {
      console.log('🖼️ Plate Image URL:', plateImageUrl);
      return plateImageUrl;
    }
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
    console.log('⚠️ No vehicle image URL found, using placeholder');
    return '/placeholder-vehicle.svg';
  };

  const openDetailsModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedVehicle(null);
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const entriesOptions = [
    { value: 10, label: '10 entries' },
    { value: 25, label: '25 entries' },
    { value: 50, label: '50 entries' },
    { value: 100, label: '100 entries' }
  ];

  return (
    <div className="bg-white dark:bg-transparent min-h-screen transition-colors duration-300">

      <PageHeader
        title="Reports & Analytics"
        description="Generate comprehensive reports and analyze vehicle data with advanced filtering options"
      />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto pb-8 px-6">

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 mb-8">
            <div className="flex flex-col items-center justify-center text-center">
              <Loader />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 mt-6">Generating Report</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Please wait while we fetch your data...
              </p>
            </div>
          </div>
        )}

        {/* Filter Section */}
        {!loading && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Filter Reports</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Plate Number Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Plate Number
                </label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. DL3CBR1119"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Date Range Picker */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <button
                  ref={dateButtonRef}
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-sm flex-1 text-left ${startDate && endDate ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>
                    {getFilterDisplayText()}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Date Range Picker Dropdown */}
                {showDatePicker && (
                  <div ref={datePickerRef} className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 p-4">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => {
                          const newMonth = new Date(currentMonth);
                          newMonth.setMonth(newMonth.getMonth() - 1);
                          setCurrentMonth(newMonth);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                      <button
                        onClick={() => {
                          const newMonth = new Date(currentMonth);
                          newMonth.setMonth(newMonth.getMonth() + 1);
                          setCurrentMonth(newMonth);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                          {day}
                        </div>
                      ))}

                      {(() => {
                        const year = currentMonth.getFullYear();
                        const month = currentMonth.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const days = [];

                        const today = new Date();
                        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                        for (let i = 0; i < firstDay; i++) {
                          days.push(<div key={`empty-${i}`} />);
                        }

                        for (let day = 1; day <= daysInMonth; day++) {
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isStart = startDate === dateStr;
                          const isEnd = endDate === dateStr;
                          const isInRange = startDate && endDate && dateStr > startDate && dateStr < endDate;
                          const isToday = dateStr === todayStr;

                          days.push(
                            <button
                              key={day}
                              onClick={() => {
                                setDatePickerError(null);
                                if (!startDate || (startDate && endDate)) {
                                  setStartDate(dateStr);
                                  setEndDate(null);
                                } else if (dateStr < startDate) {
                                  setEndDate(startDate);
                                  setStartDate(dateStr);
                                } else {
                                  const start = new Date(startDate);
                                  const end = new Date(dateStr);
                                  const diffTime = end - start;
                                  const diffDays = diffTime / (1000 * 60 * 60 * 24);

                                  if (diffDays >= 90) {
                                    setDatePickerError('You cannot select more than 90 days');
                                    return;
                                  }

                                  setEndDate(dateStr);
                                }
                              }}
                              className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors relative ${
                                isStart || isEnd
                                  ? 'bg-blue-600 text-white font-bold'
                                  : isInRange
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                  : isToday
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold ring-2 ring-green-500 dark:ring-green-600'
                                  : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        }

                        return days;
                      })()}
                    </div>

                    {/* Date Range Error */}
                    {datePickerError && (
                      <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                            {datePickerError}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
                      <button
                        onClick={() => {
                          setStartDate(null);
                          setEndDate(null);
                          setDatePickerError(null);
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => {
                          if (!startDate || !endDate) {
                            setDatePickerError('Please select both start and end dates');
                            return;
                          }

                          const start = new Date(startDate);
                          const end = new Date(endDate);
                          const today = new Date();
                          today.setHours(23, 59, 59, 999);

                          if (start > end) {
                            setDatePickerError('Start date must be before or equal to end date');
                            return;
                          }

                          if (end > today) {
                            setDatePickerError('End date cannot be in the future');
                            return;
                          }

                          const diffTime = end - start;
                          const diffDays = diffTime / (1000 * 60 * 60 * 24);
                          if (diffDays >= 90) {
                            setDatePickerError('Date range cannot exceed 90 days');
                            return;
                          }

                          setDatePickerError(null);
                          setShowDatePicker(false);
                        }}
                        disabled={!startDate || !endDate}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Filter */}
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

              {/* Checkpoint Filter */}
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

              {/* Generate Button */}
              <div className="flex items-end">
                <button
                  onClick={handleGenerateReport}
                  className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate
                </button>
              </div>
            </div>

            {/* Watchlist Filters - Custom Checkbox Design */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Show:</span>
              
              {/* Blacklist Checkbox */}
              <label className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-red-300 dark:hover:border-red-700 transition-all group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isBlacklisted}
                    onChange={(e) => setIsBlacklisted(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 peer-checked:bg-red-600 peer-checked:border-red-600 transition-all duration-200 flex items-center justify-center">
                    <svg className={`w-3 h-3 text-white transition-all duration-200 ${isBlacklisted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className={`text-sm font-medium transition-colors ${isBlacklisted ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400'}`}>
                  Blacklisted
                </span>
              </label>

                {/* Whitelist Checkbox */}
                <label className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-green-300 dark:hover:border-green-700 transition-all group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isWhitelisted}
                      onChange={(e) => setIsWhitelisted(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 peer-checked:bg-green-600 peer-checked:border-green-600 transition-all duration-200 flex items-center justify-center">
                      <svg className={`w-3 h-3 text-white transition-all duration-200 ${isWhitelisted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className={`text-sm font-medium transition-colors ${isWhitelisted ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400'}`}>
                    Whitelisted
                  </span>
                </label>
              </div>

              {/* Clear Filters Button - Only show when report is generated */}
              {reportData && (
                <button
                  onClick={() => {
                    setPlateNumber('');
                    setStartDate(null);
                    setEndDate(null);
                    setSelectedLocation('');
                    setSelectedCheckpoint('');
                    setIsBlacklisted(false);
                    setIsWhitelisted(false);
                    setDatePickerError(null);
                    setReportData(null);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-semibold mb-1">{error.title || 'Error Generating Report'}</h3>
                <p className="text-red-700 dark:text-red-400 text-sm">{error.message || error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Data State - Show when report is generated but has no data */}
        {!loading && reportData && reportData.summary_data && reportData.summary_data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 mb-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="opacity-40 grayscale">
                <Loader staticMode={true} showDots={false} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 mt-6">No Data Found</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                No records found for the selected filters. Try adjusting your date range or filters.
              </p>
            </div>
          </div>
        )}

        {/* Report Results Table */}
        {!loading && canViewTable && reportData && reportData.summary_data && reportData.summary_data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 mb-8">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Report Results ({filteredLogs.length} records)</h2>
                {canExportExcel && (
                  <button
                    onClick={async () => {
                      setExportingExcel(true);
                      setExportProgress({ current: 0, total: 0, percentage: 0, stage: 'Starting...', elapsedTime: 0 });
                      const result = await exportToExcel(
                        filteredLogs, 
                        getPlateImage, 
                        getVehicleImage, 
                        'vehicle-report',
                        (progress) => setExportProgress(progress)
                      );
                      setExportingExcel(false);
                      if (result.success) {
                        console.log(`Export completed in ${result.totalTime}s`);
                      }
                    }}
                    disabled={exportingExcel}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border border-blue-200 dark:border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportingExcel ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-700 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Excel
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Export Progress Bar - Minimalistic */}
              {exportingExcel && (
                <div className="mt-4 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {exportProgress.stage}
                    </p>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {exportProgress.percentage}%
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {exportProgress.current} / {exportProgress.total} records
                  </p>
                  
                  {/* Clean Progress Bar */}
                  <div className="relative w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${exportProgress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
              <div className="relative max-w-md">
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

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-700/30">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Location</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Checkpoint</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Plate Number</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Number Plate</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log, index) => {
                    const date = new Date(log.timestamp);
                    const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                    return (
                      <tr key={log.log_id} className={`transition-colors ${log.is_blacklisted
                        ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
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
                            <div className="font-medium">{formattedDate}</div>
                            <div className="text-gray-600 dark:text-gray-400">{formattedTime}</div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <CopyButton 
                            text={log.plate_number} 
                            className="text-sm font-bold text-gray-900 dark:text-white"
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden p-3 space-y-3">
              {currentLogs.map((log) => {
                const date = new Date(log.timestamp);
                const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                return (
                  <div key={log.log_id} className={`rounded-lg p-3 border shadow-sm ${log.is_blacklisted
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-white dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
                    }`}>
                    {/* Header with Plate Number */}
                    <div className="flex items-center justify-between mb-2">
                      <CopyButton 
                        text={log.plate_number} 
                        className="text-sm font-bold text-gray-900 dark:text-white"
                      />
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

                    {/* View Images Button */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Plate</p>
                        <img
                          src={getPlateImage(log)}
                          alt="Plate"
                          onClick={() => openDetailsModal(log)}
                          onError={(e) => {
                            console.error('Failed to load plate image, using placeholder');
                            e.target.src = '/placeholder-plate.svg';
                          }}
                          crossOrigin="anonymous"
                          className="w-full h-16 object-cover rounded border border-gray-200 dark:border-slate-600 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Vehicle</p>
                        <img
                          src={getVehicleImage(log)}
                          alt="Vehicle"
                          onClick={() => openDetailsModal(log)}
                          onError={(e) => {
                            console.error('Failed to load vehicle image, using placeholder');
                            e.target.src = '/placeholder-vehicle.svg';
                          }}
                          crossOrigin="anonymous"
                          className="w-full h-16 object-cover rounded border border-gray-200 dark:border-slate-600 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formattedDate} at {formattedTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="p-4 md:p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/20">
              {/* Results Info */}
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
                      showSearch={false}
                      icon={
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      }
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
          </div>
        )}
      </div>

      {/* Vehicle Details Modal */}
      <VehicleDetailsModal
        isOpen={detailsModalOpen}
        onClose={closeDetailsModal}
        vehicleData={selectedVehicle}
        getPlateImage={getPlateImage}
        getVehicleImage={getVehicleImage}
        canDownload={canDownloadImage}
      />
    </div>
  );
};

export default Reports;