import { useState } from 'react';
import PageHeader from '../common/PageHeader';

const RoadPulseGuide = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      ),
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Welcome to RoadPulse</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            RoadPulse is an advanced Automatic Number Plate Recognition (ANPR) system designed to monitor and track vehicles in real-time. 
            This comprehensive guide will help you navigate through all features and functionalities.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">Quick Start</h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Login with your credentials provided by the administrator</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Navigate through tabs to access different features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Use filters to refine your search and view specific data</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      ),
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Dashboard Overview</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            The Dashboard provides real-time insights and statistics about vehicle movements for today's date.
          </p>
          
          <div className="space-y-3 mt-4">
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Summary Cards</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View total vehicles, unique vehicles, blacklisted, and whitelisted counts at a glance.</p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Vehicle Logs Table</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">See detailed information about each vehicle detection including location, checkpoint, timestamp, and images.</p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Quick Actions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add vehicles to watchlist, fix incorrect plate numbers, and view vehicle timelines directly from the table.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      ),
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Generate Reports</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Create comprehensive reports with custom date ranges and filters to analyze vehicle data.
          </p>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-bold text-green-900 dark:text-green-300 mb-3">Report Features</h4>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-400">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                <span>Select custom date range (up to 90 days)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                <span>Filter by location and checkpoint</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                <span>Export to Excel with images and timestamps</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                <span>Search and filter results</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'watchlist',
      title: 'Watchlist',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      ),
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Watchlist Management</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Monitor and manage vehicles of interest with the watchlist feature. Track blacklisted and whitelisted vehicles.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="text-sm font-bold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
                Blacklist
              </h4>
              <p className="text-xs text-red-800 dark:text-red-400">Vehicles that require special attention or are restricted from entry.</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="text-sm font-bold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Whitelist
              </h4>
              <p className="text-xs text-green-800 dark:text-green-400">Authorized vehicles with special privileges or VIP status.</p>
            </div>
          </div>

          <div className="border-l-4 border-orange-500 pl-4 mt-4">
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">Operation History</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track all changes made to watchlist entries with complete audit trail including who made changes and when.</p>
          </div>
        </div>
      )
    },
    {
      id: 'permissions',
      title: 'Permissions',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      ),
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">User Permissions</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Your access to features is controlled by role-based permissions assigned by the administrator.
          </p>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-3">Permission Types</h4>
            <div className="space-y-2 text-sm text-purple-800 dark:text-purple-400">
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[100px]">View:</span>
                <span>Access to view data and information</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[100px]">Add:</span>
                <span>Ability to add new entries</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[100px]">Update:</span>
                <span>Permission to modify existing data</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[100px]">Export:</span>
                <span>Download reports and data</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tips',
      title: 'Tips & Tricks',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      ),
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tips & Tricks</h3>
          
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">💡</span>
                Quick Search
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">Use the search bar to quickly find vehicles by plate number across all tables.</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">⚡</span>
                Keyboard Shortcuts
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">Click on vehicle images to view full details in a modal with download options.</p>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-orange-600 dark:text-orange-400">🎨</span>
                Dark Mode
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">Toggle dark mode from settings for comfortable viewing in low-light conditions.</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-purple-600 dark:text-purple-400">📊</span>
                Export Reports
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">Export data to Excel with embedded images for offline analysis and record-keeping.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white dark:bg-transparent min-h-screen transition-colors duration-300">
      <PageHeader
        title="RoadPulse Guide"
        description="Complete guide to help you navigate and use all features of the ANPR system"
      />

      <div className="max-w-7xl mx-auto pb-6 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sticky top-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">Contents</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      activeSection === section.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {section.icon}
                    </svg>
                    <span className="text-sm">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 md:p-8">
              {sections.find(s => s.id === activeSection)?.content}
            </div>

            {/* Help Card */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Need More Help?</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    If you have questions or need assistance, please contact your system administrator or support team.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">support@roadpulse.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadPulseGuide;
