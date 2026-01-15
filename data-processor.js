/**
 * Data processor for normalizing Webflow CMS data
 * Converts raw API responses into normalized data structures
 */

import { parseWebflowDate, normalizeDate } from './date-utils.js';

/**
 * Filter items to only include published items (exclude archived and draft)
 * @param {Array} items - Array of items from API
 * @returns {Array} Filtered items (only published)
 */
function filterPublishedItems(items) {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  return items.filter(item => {
    // Webflow items have isArchived and isDraft properties
    // Only include items that are not archived and not draft (i.e., published)
    return !item.isArchived && !item.isDraft;
  });
}

/**
 * Process public holiday items from Webflow API
 * @param {Array} items - Raw items from API
 * @param {object} fields - Discovered field structure
 * @returns {Array} Normalized public holiday objects
 */

export function processPublicHolidays(items, fields) {
  // Filter to only published items
  const publishedItems = filterPublishedItems(items);
  
  if (!publishedItems || !Array.isArray(publishedItems)) {
    return [];
  }

  const { dateField, nameField, stateField } = fields;

  return publishedItems
    .map(item => {
      const fieldData = item.fieldData || {};
      
      // Extract date
      const dateValue = dateField ? fieldData[dateField.slug] : null;
      if (!dateValue) {
        return null; // Skip items without dates
      }

      const date = parseWebflowDate(dateValue);
      if (!date) {
        return null;
      }

      // Extract name
      const name = nameField ? (fieldData[nameField.slug] || 'Untitled Holiday') : 'Untitled Holiday';

      // Extract state references
      let stateIds = [];
      if (stateField) {
        const stateValue = fieldData[stateField.slug];
        if (stateValue) {
          if (Array.isArray(stateValue)) {
            // MultiReference - array of state IDs
            stateIds = stateValue.map(ref => ref.id || ref).filter(Boolean);
          } else if (typeof stateValue === 'object' && stateValue.id) {
            // Reference - single state object
            stateIds = [stateValue.id];
          } else if (typeof stateValue === 'string') {
            // Reference - single state ID string
            stateIds = [stateValue];
          }
        }
      }

      return {
        id: item.id,
        date: normalizeDate(date),
        name,
        stateIds,
      };
    })
    .filter(Boolean); // Remove null entries
}

/**
 * Process school holiday items from Webflow API
 * @param {Array} items - Raw items from API
 * @param {object} fields - Discovered field structure
 * @returns {Array} Normalized school holiday objects
 */
export function processSchoolHolidays(items, fields) {
  // Filter to only published items
  const publishedItems = filterPublishedItems(items);
  
  if (!publishedItems || !Array.isArray(publishedItems)) {
    return [];
  }

  const { startDateField, endDateField, nameField, stateField } = fields;

  return publishedItems
    .map(item => {
      const fieldData = item.fieldData || {};
      
      // Extract start date
      const startDateValue = startDateField ? fieldData[startDateField.slug] : null;
      if (!startDateValue) {
        return null;
      }

      const startDate = parseWebflowDate(startDateValue);
      if (!startDate) {
        return null;
      }

      // Extract end date
      const endDateValue = endDateField ? fieldData[endDateField.slug] : null;
      if (!endDateValue) {
        return null;
      }

      const endDate = parseWebflowDate(endDateValue);
      if (!endDate) {
        return null;
      }

      // Ensure end date is after start date
      if (endDate < startDate) {
        return null;
      }

      // Extract name
      const name = nameField ? (fieldData[nameField.slug] || 'Untitled Holiday') : 'Untitled Holiday';

      // Extract state reference
      let stateId = null;
      if (stateField) {
        const stateValue = fieldData[stateField.slug];
        if (stateValue) {
          if (typeof stateValue === 'object' && stateValue.id) {
            // Reference - single state object
            stateId = stateValue.id;
          } else if (typeof stateValue === 'string') {
            // Reference - single state ID string
            stateId = stateValue;
          } else if (Array.isArray(stateValue) && stateValue.length > 0) {
            // MultiReference - take first state (school holidays typically have single state)
            const firstState = stateValue[0];
            stateId = typeof firstState === 'object' ? firstState.id : firstState;
          }
        }
      }

      return {
        id: item.id,
        startDate: normalizeDate(startDate),
        endDate: normalizeDate(endDate),
        name,
        stateId,
      };
    })
    .filter(Boolean); // Remove null entries
}

/**
 * Process state items from Webflow API
 * @param {Array} items - Raw items from API
 * @param {object} fields - Discovered field structure
 * @returns {Array} Normalized state objects
 */
export function processStates(items, fields) {
  // Filter to only published items
  const publishedItems = filterPublishedItems(items);
  
  if (!publishedItems || !Array.isArray(publishedItems)) {
    return [];
  }

  const { nameField, slugField, abbreviationField } = fields;

  return publishedItems
    .map(item => {
      const fieldData = item.fieldData || {};
      
      // Extract name
      const name = nameField ? (fieldData[nameField.slug] || 'Untitled State') : 'Untitled State';
      
      // Extract slug
      const slug = slugField ? (fieldData[slugField.slug] || '') : '';
      
      // Extract abbreviation
      const abbreviation = abbreviationField ? (fieldData[abbreviationField.slug] || '') : '';

      return {
        id: item.id,
        name,
        slug,
        abbreviation,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
}



