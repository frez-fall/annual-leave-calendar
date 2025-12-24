/**
 * Collection detection and field discovery
 * Dynamically identifies collections and their field structures
 */

/**
 * Normalize collection name for matching
 * @param {string} name - Collection name
 * @returns {string} Normalized name (lowercase, trimmed)
 */
function normalizeCollectionName(name) {
  return name.toLowerCase().trim();
}

/**
 * Check if collection name matches pattern
 * @param {string} name - Collection name
 * @param {string[]} patterns - Array of patterns to match
 * @returns {boolean} True if matches
 */
function matchesPattern(name, patterns) {
  const normalized = normalizeCollectionName(name);
  return patterns.some(pattern => normalized.includes(pattern.toLowerCase()));
}

/**
 * Detect collection type by name
 * @param {object} collection - Collection object with displayName
 * @returns {string|null} Collection type: 'publicHolidays', 'schoolHolidays', 'states', or null
 */
export function detectCollectionType(collection) {
  const name = collection.displayName || collection.name || '';

  if (matchesPattern(name, ['public holiday', 'public holidays'])) {
    return 'publicHolidays';
  }

  if (matchesPattern(name, ['school holiday', 'school holidays'])) {
    return 'schoolHolidays';
  }

  if (matchesPattern(name, ['state', 'states'])) {
    return 'states';
  }

  return null;
}

/**
 * Find field by type in collection schema
 * @param {Array} fields - Array of field objects
 * @param {string} type - Field type to find
 * @returns {object|null} First matching field or null
 */
function findFieldByType(fields, type) {
  return fields.find(field => field.type === type) || null;
}

/**
 * Find field by slug pattern
 * @param {Array} fields - Array of field objects
 * @param {string[]} patterns - Array of slug patterns to match
 * @returns {object|null} First matching field or null
 */
function findFieldBySlug(fields, patterns) {
  return fields.find(field => {
    const slug = (field.slug || '').toLowerCase();
    return patterns.some(pattern => slug.includes(pattern.toLowerCase()));
  }) || null;
}

/**
 * Find state reference field (Reference or MultiReference pointing to States collection)
 * @param {Array} fields - Array of field objects
 * @param {string} statesCollectionId - States collection ID
 * @returns {object|null} State reference field or null
 */
function findStateReferenceField(fields, statesCollectionId) {
  return fields.find(field => {
    if (field.type !== 'Reference' && field.type !== 'MultiReference') {
      return false;
    }
    const validation = field.validations || {};
    return validation.collectionId === statesCollectionId;
  }) || null;
}

/**
 * Discover fields for public holidays collection
 * @param {object} collectionSchema - Collection schema from API
 * @param {string} statesCollectionId - States collection ID (if exists)
 * @returns {object} Discovered field structure
 */
export function discoverPublicHolidayFields(collectionSchema, statesCollectionId = null) {
  const fields = collectionSchema.fields || [];
  
  return {
    dateField: findFieldByType(fields, 'DateTime') || findFieldBySlug(fields, ['date']),
    nameField: findFieldBySlug(fields, ['name']) || findFieldByType(fields, 'PlainText'),
    stateField: statesCollectionId ? findStateReferenceField(fields, statesCollectionId) : null,
  };
}

/**
 * Discover fields for school holidays collection
 * @param {object} collectionSchema - Collection schema from API
 * @param {string} statesCollectionId - States collection ID (if exists)
 * @returns {object} Discovered field structure
 */
export function discoverSchoolHolidayFields(collectionSchema, statesCollectionId = null) {
  const fields = collectionSchema.fields || [];
  
  return {
    startDateField: findFieldBySlug(fields, ['start-date', 'startdate', 'start']) || 
                   findFieldByType(fields, 'DateTime'),
    endDateField: findFieldBySlug(fields, ['end-date', 'enddate', 'end']) || 
                 findFieldByType(fields, 'DateTime'),
    nameField: findFieldBySlug(fields, ['name']) || findFieldByType(fields, 'PlainText'),
    stateField: statesCollectionId ? findStateReferenceField(fields, statesCollectionId) : null,
  };
}

/**
 * Discover fields for states collection
 * @param {object} collectionSchema - Collection schema from API
 * @returns {object} Discovered field structure
 */
export function discoverStateFields(collectionSchema) {
  const fields = collectionSchema.fields || [];
  
  return {
    nameField: findFieldBySlug(fields, ['name']) || findFieldByType(fields, 'PlainText'),
    slugField: findFieldBySlug(fields, ['slug']) || null,
  };
}

/**
 * Detect and organize collections
 * @param {Array} collections - Array of all collections from API
 * @returns {object} Organized collections by type
 */
export function detectCollections(collections) {
  const result = {
    publicHolidays: null,
    schoolHolidays: null,
    states: null,
  };

  for (const collection of collections) {
    const type = detectCollectionType(collection);
    if (type) {
      result[type] = collection;
    }
  }

  return result;
}

/**
 * Check if state filtering should be enabled
 * @param {object} detectedCollections - Result from detectCollections()
 * @param {object} publicHolidayFields - Discovered public holiday fields
 * @param {object} schoolHolidayFields - Discovered school holiday fields
 * @returns {boolean} True if state filtering should be enabled
 */
export function shouldEnableStateFiltering(detectedCollections, publicHolidayFields, schoolHolidayFields) {
  if (!detectedCollections.states) {
    return false;
  }

  const hasPublicHolidayStateRef = publicHolidayFields.stateField !== null;
  const hasSchoolHolidayStateRef = schoolHolidayFields.stateField !== null;

  return hasPublicHolidayStateRef || hasSchoolHolidayStateRef;
}

