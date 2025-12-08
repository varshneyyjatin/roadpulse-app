import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../utils/fetchWrapper';
import { handleApiError } from '../../utils/apiErrorHandler';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/notifications/my-notifications`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      const errorInfo = handleApiError(err);
      setError(errorInfo.error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notifications as read
  const markAsRead = async (notificationIds) => {
    try {
      setMarkingAsRead(true);
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_BASE_URL}/notifications/mark-as-read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notification_ids: notificationIds
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notificationIds.includes(notif.notification_id)
            ? { ...notif, is_read: true }
            : notif
        )
      );

      // Update selected notification if it was marked as read
      if (selectedNotification && notificationIds.includes(selectedNotification.notification_id)) {
        setSelectedNotification({ ...selectedNotification, is_read: true });
      }

      // Dispatch custom event to notify navbar - with slight delay to ensure state update
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      }, 100);

    } catch (err) {
      console.error('Error marking notifications as read:', err);
      const errorInfo = handleApiError(err);
      alert(errorInfo.error.message || 'Failed to mark notifications as read');
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Mark all unread notifications as read
  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter(n => !n.is_read)
      .map(n => n.notification_id);
    
    if (unreadIds.length === 0) return;
    
    await markAsRead(unreadIds);
  };

  // Handle notification click - mark as read when opened
  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
    
    // Mark as read if unread
    if (!notification.is_read) {
      await markAsRead([notification.notification_id]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatTimestamp(timestamp);
  };

  return (
    <div className="bg-white dark:bg-transparent min-h-screen transition-colors duration-300">
      <PageHeader
        title="Notifications"
        description="View all your notifications and alerts in one place"
      />

      <div className="max-w-7xl mx-auto pb-6 px-6">
        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Loader />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 mt-6">Loading Notifications</h3>
              <p className="text-gray-600 dark:text-gray-400">Please wait...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-semibold mb-1">{error.title || 'Error Loading Notifications'}</h3>
                <p className="text-red-700 dark:text-red-400 text-sm">{error.message || error}</p>
              </div>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All Clear!</h3>
              <p className="text-gray-600 dark:text-gray-400">You have no notifications at the moment</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
                  <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                    {notifications.filter(n => !n.is_read).length} unread
                  </span>
                </div>
                <button 
                  onClick={markAllAsRead}
                  disabled={markingAsRead || notifications.filter(n => !n.is_read).length === 0}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markingAsRead ? 'Marking...' : 'Mark all as read'}
                </button>
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Unread</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Read</span>
                </div>
              </div>
            </div>

            {/* Gmail-style List */}
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {notifications.map((notification) => (
                <div 
                  key={notification.notification_id}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group ${
                    !notification.is_read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Left - Status Indicator */}
                  <div className="flex-shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      !notification.is_read ? 'bg-blue-600' : 'bg-transparent border-2 border-gray-300 dark:border-gray-600'
                    }`}></div>
                  </div>

                  {/* Middle - Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-1">
                      <h3 className={`text-sm truncate ${
                        !notification.is_read 
                          ? 'font-bold text-gray-900 dark:text-white' 
                          : 'font-normal text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.title}
                      </h3>
                      <span className={`text-xs flex-shrink-0 ${
                        !notification.is_read 
                          ? 'font-semibold text-gray-700 dark:text-gray-300' 
                          : 'font-normal text-gray-500 dark:text-gray-500'
                      }`}>
                        {formatTimestamp(notification.created_at)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${
                      !notification.is_read 
                        ? 'font-medium text-gray-700 dark:text-gray-300' 
                        : 'font-normal text-gray-600 dark:text-gray-400'
                    }`}>
                      {notification.message}
                    </p>
                  </div>

                  {/* Right - Expand Button */}
                  <button 
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notification);
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && showDetailsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => {
          setShowDetailsModal(false);
          setSelectedNotification(null);
        }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedNotification.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                      selectedNotification.notification_type === 'watchlist_alert' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>
                      {selectedNotification.notification_type === 'watchlist_alert' ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {selectedNotification.notification_type === 'watchlist_alert' ? 'Watchlist Alert' : 'Information'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimestamp(selectedNotification.created_at)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedNotification(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Message */}
              <div className="mb-6">
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{selectedNotification.message}</p>
              </div>

              {/* Images */}
              {(selectedNotification.vehicle_image || selectedNotification.plate_image) && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedNotification.plate_image && (
                      <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Number Plate</p>
                        <img
                          src={selectedNotification.plate_image}
                          alt="Plate"
                          onError={(e) => {
                            e.target.src = '/placeholder-plate.svg';
                          }}
                          crossOrigin="anonymous"
                          className="w-full h-48 object-contain rounded-lg"
                        />
                      </div>
                    )}
                    {selectedNotification.vehicle_image && (
                      <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Vehicle</p>
                        <img
                          src={selectedNotification.vehicle_image}
                          alt="Vehicle"
                          onError={(e) => {
                            e.target.src = '/placeholder-vehicle.svg';
                          }}
                          crossOrigin="anonymous"
                          className="w-full h-48 object-contain rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Read Status */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  {selectedNotification.is_read ? (
                    <>
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400">
                        Read on {selectedNotification.read_at ? formatTimestamp(selectedNotification.read_at) : 'just now'}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400">
                        Unread notification
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
