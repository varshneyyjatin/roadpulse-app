import { fetchWithAuth } from './fetchWrapper';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * @typedef {'blacklist' | 'whitelist' | 'unlisted'} AlertCategory
 * @typedef {Object} NotificationPreferences
 * @property {boolean} alert_blacklist
 * @property {boolean} alert_whitelist
 * @property {boolean} alert_unlisted
 */

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d.msg || d).join(', ')
          : payload?.message || 'Request failed';
    const err = new Error(message);
    err.response = { status: response.status, data: payload };
    throw err;
  }
  return payload;
};

/** @returns {Promise<NotificationPreferences>} */
export const getNotificationPreferences = async () => {
  const res = await fetchWithAuth(`${API_BASE}/notifications/preferences`);
  return parseResponse(res);
};

/** @param {NotificationPreferences} body @returns {Promise<NotificationPreferences>} */
export const updateNotificationPreferences = async (body) => {
  const res = await fetchWithAuth(`${API_BASE}/notifications/preferences`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return parseResponse(res);
};

/**
 * @param {Object} body
 * @param {boolean | null} [body.is_read]
 * @param {string | null} [body.notification_type]
 * @param {AlertCategory | null} [body.alert_category]
 * @param {number} [body.limit]
 */
export const listNotifications = async (body = {}) => {
  const res = await fetchWithAuth(`${API_BASE}/notifications/list`, {
    method: 'POST',
    body: JSON.stringify({
      is_read: null,
      notification_type: null,
      alert_category: null,
      limit: 50,
      ...body,
    }),
  });
  return parseResponse(res);
};

/**
 * @param {Object} params
 * @param {boolean} [params.is_read]
 * @param {string} [params.notification_type]
 * @param {AlertCategory} [params.alert_category]
 * @param {number} [params.limit]
 * @param {boolean} [params.nav_notification]
 */
export const getMyNotifications = async (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  const res = await fetchWithAuth(
    `${API_BASE}/notifications/my-notifications${qs ? `?${qs}` : ''}`
  );
  return parseResponse(res);
};

/** @returns {Promise<{ unread_count: number }>} */
export const getUnreadCount = async () => {
  const res = await fetchWithAuth(`${API_BASE}/notifications/unread-count`);
  return parseResponse(res);
};

/** @param {number[]} notification_ids */
export const markNotificationsRead = async (notification_ids) => {
  const res = await fetchWithAuth(`${API_BASE}/notifications/mark-as-read`, {
    method: 'POST',
    body: JSON.stringify({ notification_ids }),
  });
  return parseResponse(res);
};
