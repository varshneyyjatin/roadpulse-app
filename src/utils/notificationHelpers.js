/**
 * @typedef {'blacklist' | 'whitelist' | 'unlisted'} AlertCategory
 */

/**
 * Resolve alert category from notification (supports legacy watchlist_alert).
 * @param {import('./notificationApi').NotificationItem} notification
 * @returns {AlertCategory}
 */
export const getAlertCategory = (notification) => {
  const ctx = notification?.context_data;
  if (ctx?.alert_category) return ctx.alert_category;
  if (ctx?.is_blacklisted) return 'blacklist';
  if (ctx?.is_whitelisted) return 'whitelist';

  const type = notification?.notification_type;
  if (type === 'blacklist_alert') return 'blacklist';
  if (type === 'whitelist_alert') return 'whitelist';
  if (type === 'unlisted_alert') return 'unlisted';

  return 'unlisted';
};

/** @type {Record<AlertCategory, { label: string; badgeClass: string; iconClass: string }>} */
export const CATEGORY_STYLES = {
  blacklist: {
    label: 'Blacklist',
    badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    iconClass: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  },
  whitelist: {
    label: 'Whitelist',
    badgeClass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    iconClass: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  unlisted: {
    label: 'Unlisted',
    badgeClass: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
    iconClass: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
  },
};

/**
 * @param {import('./notificationApi').NotificationItem} notification
 */
export const getCategoryStyle = (notification) => {
  const category = getAlertCategory(notification);
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.unlisted;
};

export const DEFAULT_PREFERENCES = {
  alert_blacklist: true,
  alert_whitelist: true,
  alert_unlisted: false,
};
