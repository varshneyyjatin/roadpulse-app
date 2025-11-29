import { useState, useEffect, useRef } from 'react';
import { useAccessControl } from '../../contexts/AccessControl';
import TabSequenceModal from './TabSequenceModal';
import { saveTabOrder } from '../../utils/tabOrderStorage';

const Navbar = ({ setActiveTab, onLogout }) => {
  const { user, accessControl, selectedLocation, setSelectedLocation, logout } = useAccessControl();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMyAccountModal, setShowMyAccountModal] = useState(false);
  const [showTabSequenceModal, setShowTabSequenceModal] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showMobileLocationList, setShowMobileLocationList] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [mobileLocationSearchQuery, setMobileLocationSearchQuery] = useState('');
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const mobileButtonRef = useRef(null);
  const locationDropdownRef = useRef(null);
  const locationButtonRef = useRef(null);
  const alertDropdownRef = useRef(null);
  const alertButtonRef = useRef(null);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Filter locations based on search (only by name)
  const getFilteredLocations = (query) => {
    if (!query.trim()) return accessControl?.locations || [];
    const search = query.toLowerCase();
    return accessControl?.locations?.filter(loc => 
      loc.location_name.toLowerCase().includes(search)
    ) || [];
  };

  // Get user initials from username
  const getUserInitials = () => {
    if (!user?.username) return 'U';
    const names = user.username.split(/[._\s]/);
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Handle logout - clear all storage
  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();
    // Clear sessionStorage
    sessionStorage.clear();
    // Call logout from context
    logout();
    // Show toast notification
    if (onLogout) {
      onLogout();
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);



  useEffect(() => {
    const handleClickOutside = (event) => {
      // Desktop dropdown
      if (
        showUserDropdown &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target) &&
        !mobileDropdownRef.current?.contains(event.target) &&
        !mobileButtonRef.current?.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
      
      if (
        showLocationDropdown &&
        locationDropdownRef.current &&
        locationButtonRef.current &&
        !locationDropdownRef.current.contains(event.target) &&
        !locationButtonRef.current.contains(event.target)
      ) {
        setShowLocationDropdown(false);
      }

      if (
        showAlertDropdown &&
        alertDropdownRef.current &&
        alertButtonRef.current &&
        !alertDropdownRef.current.contains(event.target) &&
        !alertButtonRef.current.contains(event.target)
      ) {
        setShowAlertDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown, showLocationDropdown, showAlertDropdown]);

  return (
    <>
      <nav className="bg-gray-900 dark:bg-slate-800 shadow-lg transition-all duration-300 dark:border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {/* Brand Name */}
              <div>
                <h1 className="text-3xl tracking-tight" style={{ fontFamily: "'Audiowide', sans-serif" }}>
                  <span className="text-white">Road</span>
                  <span className="text-white" style={{ marginLeft: '-6px' }}>Pulse</span>
                </h1>
                <div className="text-[9px] font-medium text-gray-400 tracking-wide -mt-1">
                  Powered by Transline Technologies
                </div>
              </div>
            </div>
            
            {/* Desktop: All buttons */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <button 
                  ref={alertButtonRef}
                  onClick={() => setShowAlertDropdown(!showAlertDropdown)}
                  className="relative w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 hover:shadow-md transition"
                >
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">0</span>
                </button>

                {/* Alert Dropdown */}
                {showAlertDropdown && (
                  <div ref={alertDropdownRef} className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No new alerts</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">You're all caught up!</p>
                    </div>
                  </div>
                )}
              </div>
              
              <button onClick={() => setShowSettingsModal(!showSettingsModal)} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 hover:shadow-md transition">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>
              
              <div className="relative">
                <button 
                  ref={buttonRef}
                  onClick={() => setShowUserDropdown(!showUserDropdown)} 
                  className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200"
                >
                  <span className="text-white font-bold text-sm">{getUserInitials()}</span>
                </button>
                
                {showUserDropdown && (
                  <div ref={dropdownRef} className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50">
                    <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-md flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">{getUserInitials()}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
                          {user?.role && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded capitalize">
                              {user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <button 
                        onClick={() => {
                          setShowMyAccountModal(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition rounded-lg text-left"
                      >
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span className="font-medium">My Account</span>
                      </button>
                      
                      <hr className="my-2 border-gray-200 dark:border-slate-700" />
                      
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition rounded-lg text-left">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: user button */}
            <div className="md:hidden">
              <div className="relative">
                <button 
                  ref={mobileButtonRef}
                  onClick={() => setShowUserDropdown(!showUserDropdown)} 
                  className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200"
                >
                  <span className="text-white font-bold text-sm">{getUserInitials()}</span>
                </button>
                
                {showUserDropdown && (
                  <div ref={mobileDropdownRef} className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 max-h-[calc(100vh-8rem)] overflow-y-auto">
                  {/* User Info */}
                  <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">{getUserInitials()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
                        {user?.role && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded capitalize">
                            {user.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    {/* Theme Toggle */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Theme</div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition rounded-lg mb-1"
                    >
                      <div className="flex items-center gap-3">
                        {darkMode ? (
                          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                          </svg>
                        )}
                        <span className="font-medium">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                      </div>
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                      </div>
                    </button>



                    {/* My Account */}
                    <button 
                      onClick={() => {
                        setShowMyAccountModal(true);
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition rounded-lg text-left"
                    >
                      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <span className="font-medium">My Account</span>
                    </button>
                    
                    {/* Logout */}
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition rounded-lg text-left">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showSettingsModal && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center" onClick={() => setShowSettingsModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Change Tabs Sequence */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tabs</label>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setShowTabSequenceModal(true);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Change Tabs Sequence</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reorder tabs as you like</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Theme Mode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Theme Mode</label>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-slate-600' : 'bg-yellow-100'}`}>
                      {darkMode ? (
                        <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{darkMode ? 'Easy on the eyes' : 'Bright and clear'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      darkMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
              <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:shadow-md rounded-lg transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* My Account Modal */}
      {showMyAccountModal && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" onClick={() => setShowMyAccountModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <p className="text-lg text-gray-600 dark:text-gray-400 font-light">
                  {getGreeting()}, Welcome!
                </p>
                <button onClick={() => setShowMyAccountModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <h2 
                className="text-4xl pb-4 font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Merriweather', serif" }}
              >
                {user?.name || user?.username || 'User'}
              </h2>
            </div>

            {/* Details with Separators */}
            <div className="p-6">
              {/* Email */}
              <div className="flex items-center gap-4 py-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.email || 'N/A'}</p>
                </div>
              </div>

              {/* Separator */}
              <div className="my-4">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent dark:from-transparent dark:via-blue-600 dark:to-transparent"></div>
              </div>

              {/* Username */}
              <div className="flex items-center gap-4 py-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Username</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.username || 'N/A'}</p>
                </div>
              </div>

              {/* Separator */}
              <div className="my-4">
                <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent dark:from-transparent dark:via-purple-600 dark:to-transparent"></div>
              </div>

              {/* Joined On */}
              <div className="flex items-center gap-4 py-4">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Member Since</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {user?.created_at 
                      ? new Date(user.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-slate-700">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  Your account details are managed by your system administrator. Contact support for any changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Sequence Modal */}
      <TabSequenceModal
        isOpen={showTabSequenceModal}
        onClose={() => setShowTabSequenceModal(false)}
        tabs={accessControl?.tabs || []}
        onSave={(orderedTabs) => {
          // Create tab order mapping
          const tabOrder = {};
          orderedTabs.forEach((tab, index) => {
            tabOrder[tab.tab_id] = index;
          });
          
          // Save using utility (stores in localStorage with all users' data)
          const saved = saveTabOrder(user?.user_id, tabOrder);
          
          if (saved) {
            // Reload to apply changes
            window.location.reload();
          } else {
            alert('Failed to save tab order. Please try again.');
          }
        }}
      />
    </>
  );
};

export default Navbar;