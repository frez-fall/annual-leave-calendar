/**
 * Calendar Component - React implementation
 * Handles collection detection, data fetching, and UI rendering
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WebflowApiClient } from '../webflow-api.js';
import {
  detectCollections,
  discoverPublicHolidayFields,
  discoverSchoolHolidayFields,
  discoverStateFields,
  shouldEnableStateFiltering,
} from '../collection-detector.js';
import {
  processPublicHolidays,
  processSchoolHolidays,
  processStates,
} from '../data-processor.js';
import { calculateAllMetrics } from '../calculations.js';
import { CalendarUI } from '../calendar-ui.jsx';
import { mockPublicHolidays, mockSchoolHolidays, mockStates, delay } from './mock-data';
import { CustomDropdown } from './CustomDropdown';
import '../styles.css';

export interface CalendarProps {
  siteId?: string;
  apiEndpoint?: string;
  defaultState?: string;
  locale?: string;
  theme?: 'light' | 'dark';
  useMockData?: boolean; // Enable mock data mode for testing
}

/**
 * Main Calendar Component
 */
export function Calendar({
  siteId,
  apiEndpoint,
  defaultState,
  locale = 'en-US',
  theme = 'dark',
  useMockData = false,
}: CalendarProps) {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<[Date, Date] | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(defaultState || null);

  // Data state
  const [publicHolidays, setPublicHolidays] = useState<any[]>([]);
  const [schoolHolidays, setSchoolHolidays] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [enableStateFilter, setEnableStateFilter] = useState(false);

  // Calculations state
  const [metrics, setMetrics] = useState({
    totalDaysOff: 0,
    leaveDaysUsed: 0,
    schoolDaysAbsent: 0,
  });

  // Initialize API client
  const apiClient = useMemo(() => {
    // Skip API client if using mock data
    if (useMockData) {
      return null;
    }
    if (!siteId) {
      return null;
    }

    try {
      const client = new WebflowApiClient({
        siteId,
        apiEndpoint,
        // apiToken removed for security - use apiEndpoint with backend proxy instead
      });
      return client;
    } catch (err: any) {
      setError(`API configuration error: ${err.message}`);
      return null;
    }
  }, [siteId, apiEndpoint, useMockData]);

  // Fetch and process collections
  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use mock data if enabled
      if (useMockData) {
        // Simulate API delay
        await delay(800);
        
        // Process mock data
        const processedPublicHolidays = mockPublicHolidays.map(h => ({
          ...h,
          date: new Date(h.date),
        }));
        const processedSchoolHolidays = mockSchoolHolidays.map(h => ({
          ...h,
          startDate: new Date(h.startDate),
          endDate: new Date(h.endDate),
        }));
        const processedStates = [...mockStates];

        setPublicHolidays(processedPublicHolidays);
        setSchoolHolidays(processedSchoolHolidays);
        setStates(processedStates);
        setEnableStateFilter(true); // Mock data has states

        // Set default state
        if (defaultState && processedStates.length > 0) {
          const defaultStateObj = processedStates.find((s: any) => s.id === defaultState || s.name === defaultState);
          if (defaultStateObj) {
            setSelectedStateId(defaultStateObj.id);
          } else if (processedStates.length > 0) {
            setSelectedStateId(processedStates[0].id);
          }
        } else if (processedStates.length > 0) {
          setSelectedStateId(processedStates[0].id);
        }
        
        setLoading(false);
        return;
      }

      // Real API calls
      if (!apiClient) {
        return;
      }

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
        const defaultStateObj = processedStates.find((s: any) => s.id === defaultState || s.name === defaultState);
        if (defaultStateObj) {
          setSelectedStateId(defaultStateObj.id);
        } else if (processedStates.length > 0) {
          setSelectedStateId(processedStates[0].id);
        }
      } else if (processedStates.length > 0 && shouldEnable) {
        setSelectedStateId(processedStates[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching collections:', err);
      setError(err.message || 'Failed to load calendar data. Please check your configuration.');
    } finally {
      setLoading(false);
    }
  }, [apiClient, defaultState, useMockData]);

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
  const handleRangeChange = useCallback((range: [Date, Date] | null) => {
    setSelectedRange(range);
  }, []);

  // Handle state selection change
  const handleStateChange = useCallback((newStateId: string | null) => {
    setSelectedStateId(newStateId);
  }, []);

  // Prepare dropdown options
  const dropdownOptions = useMemo(() => {
    return states.map((state: any) => ({
      id: state.id,
      name: state.name,
      value: state.id,
    }));
  }, [states]);

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
    <div className={`calendar-component theme-${theme}`} data-theme={theme}>
      {/* Top Section: State Selector and Summary Stats */}
      <div className="calendar-header">
        {/* State Dropdown (conditional) */}
        {enableStateFilter && states.length > 0 && (
          <div className="state-selector">
            <CustomDropdown
              options={dropdownOptions}
              value={selectedStateId || ''}
              onChange={handleStateChange}
              placeholder="State"
              className="state-dropdown"
            />
          </div>
        )}

        {/* Results Display - Always visible */}
        <div className="results-display">
          <div className="metric">
            <span className="metric-value">{selectedRange && selectedRange[0] && selectedRange[1] ? metrics.totalDaysOff : 0}</span>
            <span className="metric-label">total days off</span>
          </div>
          <div className="metric">
            <span className="metric-value">{selectedRange && selectedRange[0] && selectedRange[1] ? metrics.leaveDaysUsed : 0}</span>
            <span className="metric-label">
              <span className="metric-label-desktop">leave days used</span>
              <span className="metric-label-mobile">leave days</span>
            </span>
          </div>
          <div className="metric">
            <span className="metric-value">{selectedRange && selectedRange[0] && selectedRange[1] ? metrics.schoolDaysAbsent : 0}</span>
            <span className="metric-label">school days</span>
          </div>
        </div>
      </div>

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
    </div>
  );
}

