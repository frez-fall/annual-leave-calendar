/**
 * Main Webflow Calendar Component
 * Handles collection detection, data fetching, and UI rendering
 */

import React, { useState, useEffect, useCallback } from 'react';
import { WebflowApiClient } from './webflow-api.js';
import {
  detectCollections,
  discoverPublicHolidayFields,
  discoverSchoolHolidayFields,
  discoverStateFields,
  shouldEnableStateFiltering,
} from './collection-detector.js';
import {
  processPublicHolidays,
  processSchoolHolidays,
  processStates,
} from './data-processor.js';
import { calculateAllMetrics } from './calculations.js';
import { CalendarUI } from './calendar-ui.jsx';
import './styles.css';

/**
 * Main Calendar Component
 */
export default function CalendarComponent(props) {
  // Extract props with defaults
  const {
    siteId,
    apiEndpoint,
    apiToken,
    defaultState,
    locale = 'en-US',
    theme,
  } = props;

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedStateId, setSelectedStateId] = useState(defaultState || null);

  // Data state
  const [publicHolidays, setPublicHolidays] = useState([]);
  const [schoolHolidays, setSchoolHolidays] = useState([]);
  const [states, setStates] = useState([]);
  const [enableStateFilter, setEnableStateFilter] = useState(false);

  // Calculations state
  const [metrics, setMetrics] = useState({
    totalDaysOff: 0,
    leaveDaysUsed: 0,
    schoolDaysAbsent: 0,
  });

  // Initialize API client
  const apiClient = useMemo(() => {
    if (!siteId) {
      return null;
    }

    try {
      return new WebflowApiClient({
        siteId,
        apiEndpoint,
        apiToken,
      });
    } catch (err) {
      setError(`API configuration error: ${err.message}`);
      return null;
    }
  }, [siteId, apiEndpoint, apiToken]);

  // Fetch and process collections
  const fetchCollections = useCallback(async () => {
    if (!apiClient) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: List all collections
      const allCollections = await apiClient.listCollections();
      
      // Step 2: Detect relevant collections
      const detected = detectCollections(allCollections);

      if (!detected.publicHolidays) {
        throw new Error('Public holidays collection not found. Please ensure a collection named "Public Holidays" exists.');
      }

      // Step 3: Fetch collection schemas and discover fields
      const statesCollectionId = detected.states ? detected.states.id : null;

      // Discover fields
      const publicHolidaySchema = await apiClient.getCollection(detected.publicHolidays.id);
      const publicHolidayFields = discoverPublicHolidayFields(publicHolidaySchema, statesCollectionId);

      let schoolHolidayFields = null;
      if (detected.schoolHolidays) {
        const schoolHolidaySchema = await apiClient.getCollection(detected.schoolHolidays.id);
        schoolHolidayFields = discoverSchoolHolidayFields(schoolHolidaySchema, statesCollectionId);
      }

      let stateFields = null;
      if (detected.states) {
        const stateSchema = await apiClient.getCollection(detected.states.id);
        stateFields = discoverStateFields(stateSchema);
      }

      // Step 4: Check if state filtering should be enabled
      const shouldEnable = shouldEnableStateFiltering(
        detected,
        publicHolidayFields,
        schoolHolidayFields || {}
      );
      setEnableStateFilter(shouldEnable);

      // Step 5: Fetch all items
      const [publicHolidayItems, schoolHolidayItems, stateItems] = await Promise.all([
        apiClient.fetchAllCollectionItems(detected.publicHolidays.id),
        detected.schoolHolidays
          ? apiClient.fetchAllCollectionItems(detected.schoolHolidays.id)
          : Promise.resolve([]),
        detected.states
          ? apiClient.fetchAllCollectionItems(detected.states.id)
          : Promise.resolve([]),
      ]);

      // Step 6: Process and normalize data
      const processedPublicHolidays = processPublicHolidays(publicHolidayItems, publicHolidayFields);
      const processedSchoolHolidays = schoolHolidayFields
        ? processSchoolHolidays(schoolHolidayItems, schoolHolidayFields)
        : [];
      const processedStates = stateFields ? processStates(stateItems, stateFields) : [];

      setPublicHolidays(processedPublicHolidays);
      setSchoolHolidays(processedSchoolHolidays);
      setStates(processedStates);

      // Set default state if provided and exists
      if (defaultState && processedStates.length > 0) {
        const defaultStateObj = processedStates.find(s => s.id === defaultState || s.name === defaultState);
        if (defaultStateObj) {
          setSelectedStateId(defaultStateObj.id);
        } else if (processedStates.length > 0) {
          setSelectedStateId(processedStates[0].id);
        }
      } else if (processedStates.length > 0 && shouldEnable) {
        setSelectedStateId(processedStates[0].id);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError(err.message || 'Failed to load calendar data. Please check your configuration.');
    } finally {
      setLoading(false);
    }
  }, [apiClient, defaultState]);

  // Fetch collections on mount
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Update calculations when selection or state changes
  useEffect(() => {
    if (selectedRange && selectedRange[0] && selectedRange[1]) {
      const [startDate, endDate] = selectedRange;
      const newMetrics = calculateAllMetrics(
        startDate,
        endDate,
        publicHolidays,
        schoolHolidays,
        selectedStateId
      );
      setMetrics(newMetrics);
    } else {
      setMetrics({
        totalDaysOff: 0,
        leaveDaysUsed: 0,
        schoolDaysAbsent: 0,
      });
    }
  }, [selectedRange, publicHolidays, schoolHolidays, selectedStateId]);

  // Handle date range change
  const handleRangeChange = useCallback((range) => {
    setSelectedRange(range);
  }, []);

  // Handle state selection change
  const handleStateChange = useCallback((event) => {
    const newStateId = event.target.value || null;
    setSelectedStateId(newStateId);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="calendar-component loading">
        <div className="loading-message">Loading calendar data...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="calendar-component error">
        <div className="error-message">{error}</div>
        <button onClick={fetchCollections} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="calendar-component">
      {/* State Dropdown (conditional) */}
      {enableStateFilter && states.length > 0 && (
        <div className="state-selector">
          <label htmlFor="state-select">State:</label>
          <select
            id="state-select"
            value={selectedStateId || ''}
            onChange={handleStateChange}
            className="state-dropdown"
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>
                {state.abbreviation || state.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Calendar UI */}
      <CalendarUI
        selectedRange={selectedRange}
        onRangeChange={handleRangeChange}
        publicHolidays={publicHolidays}
        schoolHolidays={schoolHolidays}
        selectedStateId={selectedStateId}
        locale={locale}
        theme={theme}
      />

      {/* Results Display */}
      {selectedRange && selectedRange[0] && selectedRange[1] && (
        <div className="results-display">
          <div className="metric">
            <span className="metric-label">Total Days Off:</span>
            <span className="metric-value">{metrics.totalDaysOff}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Leave Days Used:</span>
            <span className="metric-value">{metrics.leaveDaysUsed}</span>
          </div>
          <div className="metric">
            <span className="metric-label">School Days Absent:</span>
            <span className="metric-value">{metrics.schoolDaysAbsent}</span>
          </div>
        </div>
      )}
    </div>
  );
}



