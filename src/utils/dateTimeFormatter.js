/**
 * Utility functions for date and time formatting
 */

/**
 * Format date with optional time for API requests
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string|null} time - Time in HH:mm format (optional)
 * @returns {string} - Formatted date or datetime string
 * 
 * Examples:
 * formatDateTimeForAPI("2026-05-01", null) => "2026-05-01"
 * formatDateTimeForAPI("2026-05-01", "08:00") => "2026-05-01T08:00:00"
 */
export const formatDateTimeForAPI = (date, time = null) => {
  if (!date) return null;
  
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  
  if (time) {
    return `${dateStr}T${time}:00`;
  }
  
  return dateStr;
};

/**
 * Parse datetime string from API response
 * @param {string} dateTimeStr - DateTime string from API (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 * @returns {object} - Object with date and time parts
 * 
 * Examples:
 * parseDateTimeFromAPI("2026-05-01") => { date: "2026-05-01", time: null, hasTime: false }
 * parseDateTimeFromAPI("2026-05-01T08:00:00") => { date: "2026-05-01", time: "08:00", hasTime: true }
 */
export const parseDateTimeFromAPI = (dateTimeStr) => {
  if (!dateTimeStr) return { date: null, time: null, hasTime: false };
  
  if (dateTimeStr.includes('T')) {
    const [datePart, timePart] = dateTimeStr.split('T');
    const time = timePart.substring(0, 5); // Extract HH:mm
    return { date: datePart, time, hasTime: true };
  }
  
  return { date: dateTimeStr, time: null, hasTime: false };
};

/**
 * Format datetime for display in UI
 * @param {string} dateTimeStr - DateTime string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 * @param {object} options - Formatting options
 * @returns {string} - Formatted display string
 * 
 * Examples:
 * formatDateTimeForDisplay("2026-05-01") => "01 May 2026"
 * formatDateTimeForDisplay("2026-05-01T08:00:00") => "01 May 2026 08:00"
 */
export const formatDateTimeForDisplay = (dateTimeStr, options = {}) => {
  if (!dateTimeStr) return '';
  
  const { locale = 'en-GB', dateStyle = { day: '2-digit', month: 'short', year: 'numeric' } } = options;
  
  if (dateTimeStr.includes('T')) {
    const [datePart, timePart] = dateTimeStr.split('T');
    const date = new Date(datePart);
    const time = timePart.substring(0, 5);
    return `${date.toLocaleDateString(locale, dateStyle)} ${time}`;
  }
  
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString(locale, dateStyle);
};
