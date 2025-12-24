/**
 * Date utility functions for calendar and leave planning calculations
 */

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {Date} date - Date to check
 * @returns {boolean} True if weekend
 */
export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if a date falls within a date range (inclusive)
 * @param {Date} date - Date to check
 * @param {Date} startDate - Start of range
 * @param {Date} endDate - End of range
 * @returns {boolean} True if date is within range
 */
export function isDateInRange(date, startDate, endDate) {
  const dateTime = date.getTime();
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  return dateTime >= startTime && dateTime <= endTime;
}

/**
 * Check if a date matches a specific date (ignoring time)
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if dates match (same day)
 */
export function isSameDate(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get all dates in a range (inclusive)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Date[]} Array of dates in range
 */
export function getDatesInRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Check if a date falls within any school holiday period
 * @param {Date} date - Date to check
 * @param {Array} schoolHolidays - Array of school holiday objects with startDate and endDate
 * @param {string|null} selectedStateId - Optional state ID to filter holidays
 * @returns {boolean} True if date is within a school holiday period
 */
export function isDateInSchoolHoliday(date, schoolHolidays, selectedStateId = null) {
  if (!schoolHolidays || schoolHolidays.length === 0) {
    return false;
  }

  return schoolHolidays.some(holiday => {
    // Filter by state if provided
    if (selectedStateId && holiday.stateId && holiday.stateId !== selectedStateId) {
      return false;
    }

    return isDateInRange(date, holiday.startDate, holiday.endDate);
  });
}

/**
 * Check if a date is a public holiday
 * @param {Date} date - Date to check
 * @param {Array} publicHolidays - Array of public holiday objects with date property
 * @param {string|null} selectedStateId - Optional state ID to filter holidays
 * @returns {boolean} True if date is a public holiday
 */
export function isPublicHoliday(date, publicHolidays, selectedStateId = null) {
  if (!publicHolidays || publicHolidays.length === 0) {
    return false;
  }

  return publicHolidays.some(holiday => {
    // Filter by state if provided (check if stateIds array includes selectedStateId)
    if (selectedStateId && holiday.stateIds && !holiday.stateIds.includes(selectedStateId)) {
      return false;
    }

    return isSameDate(date, holiday.date);
  });
}

/**
 * Check if a date is any type of holiday
 * @param {Date} date - Date to check
 * @param {Array} publicHolidays - Array of public holidays
 * @param {Array} schoolHolidays - Array of school holidays
 * @param {string|null} selectedStateId - Optional state ID to filter holidays
 * @returns {boolean} True if date is any holiday
 */
export function isHoliday(date, publicHolidays, schoolHolidays, selectedStateId = null) {
  return (
    isPublicHoliday(date, publicHolidays, selectedStateId) ||
    isDateInSchoolHoliday(date, schoolHolidays, selectedStateId)
  );
}

/**
 * Normalize date to start of day (remove time component)
 * @param {Date} date - Date to normalize
 * @returns {Date} Normalized date
 */
export function normalizeDate(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Parse date string from Webflow API (ISO format)
 * @param {string} dateString - ISO date string
 * @returns {Date} Parsed date
 */
export function parseWebflowDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return normalizeDate(date);
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted date string
 */
export function formatDate(date, locale = 'en-US') {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

