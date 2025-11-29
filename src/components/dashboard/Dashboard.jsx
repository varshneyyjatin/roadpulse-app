import { useState, useEffect, useRef } from 'react';
import { useAccessControl } from '../../contexts/AccessControl';
import DashboardKpis from './DashboardKpis';
import DashboardSummaryTable from './DashboardSummaryTable';
import ErrorState from '../common/ErrorState';
import { FullPageLoader } from '../common/Loader';
import { handleApiError } from '../../utils/apiErrorHandler';
import { fetchWithAuth } from '../../utils/fetchWrapper';

const Dashboard = () => {
  const { getTabComponents, hasPermissionForComponent, user, accessControl } = useAccessControl();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [datePickerError, setDatePickerError] = useState(null);
  const datePickerRef = useRef(null);
  const dateButtonRef = useRef(null);
  
  const [appliedFilters, setAppliedFilters] = useState({
    location_ids: null,
    checkpoint_ids: null,
    start_date: null,
    end_date: null
  });

  const components = getTabComponents('Dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  const fetchDashboardData = async (filters = appliedFilters) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');

      const requestBody = {
        scope: 'dashboard',
        location_ids: filters.location_ids,
        checkpoint_ids: filters.checkpoint_ids,
        start_date: filters.start_date,
        end_date: filters.end_date
      };

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
      setDashboardData(data);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    fetchDashboardData(filters);
  };

  const getFilterDisplayText = () => {
    const { start_date, end_date } = appliedFilters;

    // If no filters applied, show today's date
    if (!start_date && !end_date) {
      return `Records: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }

    // Build filter text with date range
    if (start_date && end_date) {
      const startFormatted = new Date(start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const endFormatted = new Date(end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return `Records: ${startFormatted} - ${endFormatted}`;
    } else if (start_date) {
      const startFormatted = new Date(start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return `Records: From ${startFormatted}`;
    } else if (end_date) {
      const endFormatted = new Date(end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return `Records: Until ${endFormatted}`;
    }

    return `Records: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  };



  if (loading) {
    return <FullPageLoader message="Loading Dashboard" />;
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-transparent min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ErrorState
            title={error.title}
            message={error.message}
            icon={error.icon}
            statusCode={error.statusCode}
            onRetry={fetchDashboardData}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-transparent min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
          {/* Dashboard Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
              {/* Left Section - Greeting & Company Name Badge */}
              <div className="flex-1 w-full lg:w-auto">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour < 12) return 'Good Morning';
                    if (hour < 16) return 'Good Afternoon';
                    if (hour < 22) return 'Good Evening';
                    return 'Good Night';
                  })()}, {user?.name || 'User'}! 
                </h1>
                {user?.company_name && (
                  <div className="inline-flex items-center gap-1 py-1.5 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {user.company_name}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Section - Date & Filter Card */}
              {hasPermissionForComponent('Dashboard', 'comp003', 'can_view') && (
                <div className="w-full lg:w-auto relative">
                  <button
                    ref={dateButtonRef}
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium truncate text-xs sm:text-sm text-gray-900 dark:text-white flex-1 text-left">{getFilterDisplayText()}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Date Range Picker Dropdown */}
                  {showDatePicker && (
                    <div ref={datePickerRef} className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 p-4">
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
                            
                            // Get today's date for highlighting
                            const today = new Date();
                            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                            
                            // Empty cells
                            for (let i = 0; i < firstDay; i++) {
                              days.push(<div key={`empty-${i}`} />);
                            }
                            
                            // Days
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
                                    setDatePickerError(null); // Clear error on date selection
                                    if (!startDate || (startDate && endDate)) {
                                      setStartDate(dateStr);
                                      setEndDate(null);
                                    } else if (dateStr < startDate) {
                                      setEndDate(startDate);
                                      setStartDate(dateStr);
                                    } else {
                                      // Check if range exceeds 30 days before setting end date
                                      const start = new Date(startDate);
                                      const end = new Date(dateStr);
                                      const diffTime = end - start;
                                      const diffDays = diffTime / (1000 * 60 * 60 * 24);
                                      
                                      if (diffDays >= 30) {
                                        setDatePickerError('You cannot select more than 30 days');
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
                              setAppliedFilters({ ...appliedFilters, start_date: null, end_date: null });
                              fetchDashboardData({ ...appliedFilters, start_date: null, end_date: null });
                              setShowDatePicker(false);
                            }}
                            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => {
                              // Validation
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
                              if (diffDays >= 30) {
                                setDatePickerError('Date range cannot exceed 30 days');
                                return;
                              }
                              
                              // All validations passed
                              setDatePickerError(null);
                              setAppliedFilters({ ...appliedFilters, start_date: startDate, end_date: endDate });
                              fetchDashboardData({ ...appliedFilters, start_date: startDate, end_date: endDate });
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
              )}
            </div>
          </div>

          {/* Render components based on permissions */}
          {components.map((component) => {
            if (!component.permissions.can_view) return null;

            // comp001 = KPIs
            if (component.component_code === 'comp001') {
              return (
                <DashboardKpis
                  key={component.component_id}
                  data={dashboardData}
                  appliedFilters={appliedFilters}
                  locations={accessControl?.locations || []}
                />
              );
            }

            // comp002 = Table
            if (component.component_code === 'comp002') {
              return (
                <DashboardSummaryTable
                  key={component.component_id}
                  data={dashboardData}
                  appliedFilters={appliedFilters}
                  canAddToWatchlist={hasPermissionForComponent('Dashboard', 'comp004', 'can_view')}
                  canFixVehicleNumber={hasPermissionForComponent('Dashboard', 'comp005', 'can_view')}
                  canDownloadImage={hasPermissionForComponent('Dashboard', 'comp006', 'can_view')}
                  onDataRefresh={fetchDashboardData}
                />
              );
            }

            return null;
          })}
        </div>
      </div>


    </>
  );
};

export default Dashboard;