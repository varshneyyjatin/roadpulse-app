import { useState, useEffect, useMemo, useCallback } from 'react';
import { listNotifications, markNotificationsRead } from '../../utils/notificationApi';
import { getAlertCategory } from '../../utils/notificationHelpers';
import { handleApiError } from '../../utils/apiErrorHandler';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import NotificationCategoryBadge from './NotificationCategoryBadge';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'blacklist', label: 'Blacklist' },
  { id: 'whitelist', label: 'Whitelist' },
  { id: 'unlisted', label: 'Unlisted' },
];

const TAB_STYLES = {
  all: { active: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900', idle: '' },
  blacklist: { active: 'bg-red-600 text-white', idle: '' },
  whitelist: { active: 'bg-emerald-600 text-white', idle: '' },
  unlisted: { active: 'bg-violet-600 text-white', idle: '' },
};

const Notifications = () => {
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  useBodyScrollLock(!!selectedNotification && showDetailsModal);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listNotifications({
        is_read: null,
        notification_type: null,
        alert_category: null,
        limit: 100,
      });
      setAllNotifications(data.notifications || []);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const onUpdated = () => fetchNotifications();
    window.addEventListener('notificationsUpdated', onUpdated);
    return () => window.removeEventListener('notificationsUpdated', onUpdated);
  }, [fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return allNotifications;
    return allNotifications.filter((n) => getAlertCategory(n) === activeTab);
  }, [allNotifications, activeTab]);

  const tabCounts = useMemo(() => {
    const counts = { all: allNotifications.length, blacklist: 0, whitelist: 0, unlisted: 0 };
    allNotifications.forEach((n) => {
      const cat = getAlertCategory(n);
      if (counts[cat] !== undefined) counts[cat] += 1;
    });
    return counts;
  }, [allNotifications]);

  const unreadCount = useMemo(
    () => filteredNotifications.filter((n) => !n.is_read).length,
    [filteredNotifications]
  );

  const markAsRead = async (notificationIds) => {
    try {
      setMarkingAsRead(true);
      await markNotificationsRead(notificationIds);

      setAllNotifications((prev) =>
        prev.map((notif) =>
          notificationIds.includes(notif.notification_id)
            ? { ...notif, is_read: true }
            : notif
        )
      );

      if (
        selectedNotification &&
        notificationIds.includes(selectedNotification.notification_id)
      ) {
        setSelectedNotification({ ...selectedNotification, is_read: true });
      }

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      }, 100);
    } catch (err) {
      const errorInfo = handleApiError(err);
      alert(errorInfo.error.message || 'Failed to mark notifications as read');
    } finally {
      setMarkingAsRead(false);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = filteredNotifications
      .filter((n) => !n.is_read)
      .map((n) => n.notification_id);
    if (unreadIds.length === 0) return;
    await markAsRead(unreadIds);
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
    if (!notification.is_read) {
      await markAsRead([notification.notification_id]);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const plateImage = (n) => n.plate_image || n.context_data?.plate_image;
  const vehicleImage = (n) => n.vehicle_image || n.context_data?.vehicle_image;

  const activeFilterLabel =
    CATEGORY_FILTERS.find((f) => f.id === activeTab)?.label ?? 'All';

  const renderListBody = () => {
    if (loading) {
      return (
        <div className="py-16 flex flex-col items-center justify-center">
          <Loader />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Loading notifications…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-800 dark:text-red-300 font-semibold text-sm mb-1">
              {error.title || 'Error loading notifications'}
            </p>
            <p className="text-red-700 dark:text-red-400 text-sm">{error.message || String(error)}</p>
            <button
              type="button"
              onClick={fetchNotifications}
              className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <div className="py-16 px-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">All clear</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeTab === 'all'
              ? 'You have no notifications right now.'
              : `No ${activeFilterLabel.toLowerCase()} notifications.`}
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-200 dark:divide-slate-700">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.notification_id}
            className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${
              !notification.is_read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
            }`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex-shrink-0">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  !notification.is_read
                    ? 'bg-blue-600'
                    : 'bg-transparent border-2 border-gray-300 dark:border-slate-600'
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <NotificationCategoryBadge notification={notification} size="xs" />
                {notification.context_data?.plate_number && (
                  <span className="text-xs font-mono font-semibold text-gray-600 dark:text-gray-400">
                    {notification.context_data.plate_number}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-3 mb-1">
                <h3
                  className={`text-sm truncate ${
                    !notification.is_read
                      ? 'font-bold text-gray-900 dark:text-white'
                      : 'font-normal text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {notification.title}
                </h3>
                <span className="text-xs flex-shrink-0 text-gray-500 dark:text-gray-400">
                  {formatTimestamp(notification.created_at)}
                </span>
              </div>
              <p className="text-sm truncate text-gray-600 dark:text-gray-400">
                {notification.message}
              </p>
            </div>

            <button
              type="button"
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg"
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
    );
  };

  return (
    <div className="bg-white dark:bg-transparent min-h-screen transition-colors duration-300">
      <PageHeader
        title="Notifications"
        description="View and filter your vehicle detection alerts"
      />

      <div className="max-w-7xl mx-auto pb-6 px-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* Toolbar — always visible */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
                <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                  {unreadCount} unread
                </span>
                {!loading && allNotifications.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {filteredNotifications.length} shown
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={markingAsRead || unreadCount === 0 || loading}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
              >
                {markingAsRead ? 'Marking…' : 'Mark all as read'}
              </button>
            </div>

            {/* Filter tabs */}
            <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-slate-700/60 border border-gray-200/80 dark:border-slate-600/80 w-full sm:w-auto">
              {CATEGORY_FILTERS.map(({ id, label }) => {
                const isActive = activeTab === id;
                const count = tabCounts[id] ?? 0;
                const tabStyle = TAB_STYLES[id];

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? `${tabStyle.active} shadow-sm`
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {label}
                    <span
                      className={`min-w-[18px] px-1 py-0.5 rounded-md text-[10px] font-bold leading-none ${
                        isActive
                          ? 'bg-white/20 text-inherit'
                          : 'bg-gray-200/80 dark:bg-slate-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {renderListBody()}
        </div>
      </div>

      {selectedNotification && showDetailsModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowDetailsModal(false);
            setSelectedNotification(null);
          }}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedNotification.title}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <NotificationCategoryBadge notification={selectedNotification} />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimestamp(selectedNotification.created_at)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedNotification(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
              <div className="mb-6">
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              {selectedNotification.context_data && (
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {selectedNotification.context_data.plate_number && (
                    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Plate number
                      </p>
                      <p className="font-mono font-bold text-gray-900 dark:text-white">
                        {selectedNotification.context_data.plate_number}
                      </p>
                    </div>
                  )}
                  {selectedNotification.context_data.location_name && (
                    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Location
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedNotification.context_data.location_name}
                      </p>
                    </div>
                  )}
                  {selectedNotification.context_data.checkpoint_name && (
                    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Checkpoint
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedNotification.context_data.checkpoint_name}
                      </p>
                    </div>
                  )}
                  {selectedNotification.context_data.timestamp && (
                    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Detection time
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedNotification.context_data.timestamp}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(plateImage(selectedNotification) || vehicleImage(selectedNotification)) && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plateImage(selectedNotification) && (
                    <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Number Plate
                      </p>
                      <img
                        src={plateImage(selectedNotification)}
                        alt="Plate"
                        onError={(e) => {
                          e.target.src = '/placeholder-plate.svg';
                        }}
                        crossOrigin="anonymous"
                        className="w-full h-48 object-contain rounded-lg"
                      />
                    </div>
                  )}
                  {vehicleImage(selectedNotification) && (
                    <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Vehicle
                      </p>
                      <img
                        src={vehicleImage(selectedNotification)}
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
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-400">
                {selectedNotification.is_read
                  ? `Read${selectedNotification.read_at ? ` · ${formatTimestamp(selectedNotification.read_at)}` : ''}`
                  : 'Unread'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
