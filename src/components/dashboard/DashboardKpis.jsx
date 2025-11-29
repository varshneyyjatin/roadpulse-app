import { useState } from 'react';
import LocationDetailsModal from './LocationDetailsModal';
import CameraDetailsModal from './CameraDetailsModal';

const DashboardKpis = ({ data, appliedFilters, locations }) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Calculate counts from summary_data (filtered results)
  const summaryData = data?.summary_data || [];
  const totalVehiclesInView = summaryData.length;
  const blacklistedInView = summaryData.filter(log => log.is_blacklisted).length;

  // Check if date filter is applied
  const hasDateFilter = appliedFilters?.start_date || appliedFilters?.end_date;
  const vehicleCountLabel = hasDateFilter ? 'Filtered count' : "Today's count";

  return (
    <>
      {/* Modals */}
      <LocationDetailsModal 
        isOpen={showLocationModal} 
        onClose={() => setShowLocationModal(false)} 
        locations={locations}
      />
      <CameraDetailsModal 
        isOpen={showCameraModal} 
        onClose={() => setShowCameraModal(false)} 
        locations={locations}
      />
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 mb-8 overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total Vehicles */}
        <div className="p-6 relative group hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 border-b sm:border-b-0 sm:border-r border-transparent hover:shadow-xl">
          {/* Gradient Separator */}
          <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-blue-200 dark:via-blue-800 to-transparent"></div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0h-.01M15 17a2 2 0 104 0m-4 0h-.01" />
                </svg>
              </div>
              <div className="text-right">
                <h3 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-1">
                  {totalVehiclesInView?.toLocaleString() || '0'}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Total Vehicles</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-medium">{vehicleCountLabel}</span>
            </div>
          </div>
        </div>

        {/* Total Locations */}
        <div 
          onClick={() => setShowLocationModal(true)}
          className="p-6 relative group hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 border-b sm:border-b-0 sm:border-r border-transparent hover:shadow-xl cursor-pointer"
        >
          {/* Gradient Separator */}
          <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-green-200 dark:via-green-800 to-transparent"></div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 dark:from-green-600 dark:to-green-700 rounded-xl flex items-center justify-center shadow-sm shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-right">
                <h3 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent mb-1">
                  {data?.total_locations?.toLocaleString() || '0'}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Total Locations</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="font-medium">Assigned locations</span>
            </div>
          </div>
        </div>

        {/* Total Cameras */}
        <div 
          onClick={() => setShowCameraModal(true)}
          className="p-6 relative group hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 border-b sm:border-b-0 sm:border-r border-transparent hover:shadow-xl cursor-pointer"
        >
          {/* Gradient Separator */}
          <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-purple-200 dark:via-purple-800 to-transparent"></div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 dark:from-purple-600 dark:to-purple-700 rounded-xl flex items-center justify-center shadow-sm shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-right">
                <h3 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent mb-1">
                  {data?.total_cameras?.toLocaleString() || '0'}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Total Cameras</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Monitoring devices</span>
            </div>
          </div>
        </div>

        {/* Blacklisted Vehicles */}
        <div className="p-6 relative group hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-500 dark:from-red-600 dark:to-red-700 rounded-xl flex items-center justify-center shadow-sm shadow-red-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-right">
                <h3 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-red-800 dark:from-red-400 dark:to-red-600 bg-clip-text text-transparent mb-1">
                  {blacklistedInView?.toLocaleString() || '0'}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Blacklisted</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-medium">Restricted vehicles</span>
            </div>
          </div>
        </div>

      </div>
    </div>
    </>
  );
};

export default DashboardKpis;