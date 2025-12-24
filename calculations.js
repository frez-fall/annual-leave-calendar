/**
 * Calculation engine for leave planning
 * Calculates total days off, leave days used, and school days absent
 */

import {
  isWeekend,
  isPublicHoliday,
  isDateInSchoolHoliday,
  isHoliday,
  getDatesInRange,
} from './date-utils.js';

/**
 * Calculate total days off
 * Includes all selected dates plus all holidays within the selected range
 * @param {Date} startDate - Start of selected date range
 * @param {Date} endDate - End of selected date range
 * @param {Array} publicHolidays - Array of public holiday objects
 * @param {Array} schoolHolidays - Array of school holiday objects
 * @param {string|null} selectedStateId - Optional state ID for filtering
 * @returns {number} Total days off
 */
export function calculateTotalDaysOff(startDate, endDate, publicHolidays, schoolHolidays, selectedStateId = null) {
  if (!startDate || !endDate) {
    return 0;
  }

  const selectedDates = getDatesInRange(startDate, endDate);
  const selectedDateSet = new Set(selectedDates.map(d => d.toISOString().split('T')[0]));

  // Get all holidays within the selected range
  const holidaysInRange = new Set();

  // Add public holidays in range
  if (publicHolidays) {
    publicHolidays.forEach(holiday => {
      // Filter by state if provided
      if (selectedStateId && holiday.stateIds && !holiday.stateIds.includes(selectedStateId)) {
        return;
      }

      const holidayDate = holiday.date;
      if (holidayDate >= startDate && holidayDate <= endDate) {
        const dateKey = holidayDate.toISOString().split('T')[0];
        holidaysInRange.add(dateKey);
      }
    });
  }

  // Add school holidays in range
  if (schoolHolidays) {
    schoolHolidays.forEach(holiday => {
      // Filter by state if provided
      if (selectedStateId && holiday.stateId && holiday.stateId !== selectedStateId) {
        return;
      }

      const holidayStart = holiday.startDate;
      const holidayEnd = holiday.endDate;
      
      // Check if holiday period overlaps with selected range
      if (holidayStart <= endDate && holidayEnd >= startDate) {
        // Add all dates in the overlapping period
        const overlapStart = holidayStart > startDate ? holidayStart : startDate;
        const overlapEnd = holidayEnd < endDate ? holidayEnd : endDate;
        const holidayDates = getDatesInRange(overlapStart, overlapEnd);
        
        holidayDates.forEach(date => {
          const dateKey = date.toISOString().split('T')[0];
          holidaysInRange.add(dateKey);
        });
      }
    });
  }

  // Total = selected dates + holidays in range (union of both sets)
  const totalSet = new Set([...selectedDateSet, ...holidaysInRange]);
  return totalSet.size;
}

/**
 * Calculate leave days used
 * Selected dates excluding weekends and public holidays only (NOT school holidays)
 * @param {Date} startDate - Start of selected date range
 * @param {Date} endDate - End of selected date range
 * @param {Array} publicHolidays - Array of public holiday objects
 * @param {Array} schoolHolidays - Array of school holiday objects (not used in calculation)
 * @param {string|null} selectedStateId - Optional state ID for filtering
 * @returns {number} Leave days used
 */
export function calculateLeaveDaysUsed(startDate, endDate, publicHolidays, schoolHolidays, selectedStateId = null) {
  if (!startDate || !endDate) {
    return 0;
  }

  const selectedDates = getDatesInRange(startDate, endDate);
  
  return selectedDates.filter(date => {
    // Exclude weekends
    if (isWeekend(date)) {
      return false;
    }

    // Exclude public holidays only (school holidays are NOT excluded)
    if (isPublicHoliday(date, publicHolidays, selectedStateId)) {
      return false;
    }

    return true;
  }).length;
}

/**
 * Calculate school days absent
 * Selected dates excluding weekends, public holidays, and school holiday periods
 * @param {Date} startDate - Start of selected date range
 * @param {Date} endDate - End of selected date range
 * @param {Array} publicHolidays - Array of public holiday objects
 * @param {Array} schoolHolidays - Array of school holiday objects
 * @param {string|null} selectedStateId - Optional state ID for filtering
 * @returns {number} School days absent
 */
export function calculateSchoolDaysAbsent(startDate, endDate, publicHolidays, schoolHolidays, selectedStateId = null) {
  if (!startDate || !endDate) {
    return 0;
  }

  const selectedDates = getDatesInRange(startDate, endDate);
  
  return selectedDates.filter(date => {
    // Exclude weekends
    if (isWeekend(date)) {
      return false;
    }

    // Exclude public holidays
    if (isPublicHoliday(date, publicHolidays, selectedStateId)) {
      return false;
    }

    // Exclude school holiday periods
    if (isDateInSchoolHoliday(date, schoolHolidays, selectedStateId)) {
      return false;
    }

    return true;
  }).length;
}

/**
 * Calculate all metrics at once
 * @param {Date} startDate - Start of selected date range
 * @param {Date} endDate - End of selected date range
 * @param {Array} publicHolidays - Array of public holiday objects
 * @param {Array} schoolHolidays - Array of school holiday objects
 * @param {string|null} selectedStateId - Optional state ID for filtering
 * @returns {object} Object with totalDaysOff, leaveDaysUsed, schoolDaysAbsent
 */
export function calculateAllMetrics(startDate, endDate, publicHolidays, schoolHolidays, selectedStateId = null) {
  return {
    totalDaysOff: calculateTotalDaysOff(startDate, endDate, publicHolidays, schoolHolidays, selectedStateId),
    leaveDaysUsed: calculateLeaveDaysUsed(startDate, endDate, publicHolidays, schoolHolidays, selectedStateId),
    schoolDaysAbsent: calculateSchoolDaysAbsent(startDate, endDate, publicHolidays, schoolHolidays, selectedStateId),
  };
}

