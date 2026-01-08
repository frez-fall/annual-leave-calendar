/**
 * Calendar UI Component using Mantine DatePicker
 * Handles date range selection and holiday highlighting
 */

import React, { useState, useEffect, useMemo } from 'react';
import { DatePicker } from '@mantine/dates';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { isPublicHoliday, isDateInSchoolHoliday } from './date-utils.js';

/**
 * Calendar UI Component
 */
export function CalendarUI({
  selectedRange,
  onRangeChange,
  publicHolidays = [],
  schoolHolidays = [],
  selectedStateId = null,
  locale = 'en-US',
  theme,
}) {
  // Initialize value properly for range picker - Mantine DatePicker with type="range" expects [Date, Date] or [null, null]
  const [value, setValue] = useState(() => {
    if (selectedRange && Array.isArray(selectedRange) && selectedRange.length === 2 && selectedRange[0] && selectedRange[1]) {
      return selectedRange;
    }
    // Use [null, null] instead of null to avoid Mantine's null access error
    return [null, null];
  });
  
  // Update value when selectedRange prop changes
  // Only sync complete ranges from parent to avoid overwriting partial selections
  useEffect(() => {
    if (selectedRange && Array.isArray(selectedRange) && selectedRange.length === 2 && selectedRange[0] && selectedRange[1]) {
      // Only sync complete ranges from parent
      // Don't overwrite if we have a partial selection in progress (start date only)
      const hasPartialSelection = value && value[0] && !value[1];
      if (!hasPartialSelection) {
        setValue(selectedRange);
      }
    } else if (!selectedRange) {
      // Only clear if we don't have a partial selection in progress
      const hasPartialSelection = value && value[0] && !value[1];
      if (!hasPartialSelection) {
        setValue([null, null]);
      }
    }
  }, [selectedRange]);

  // Handle date range change
  const handleChange = (newValue) => {
    // Mantine returns null, [Date, null], or [Date, Date] for range picker
    // Normalize to [null, null] if null to avoid errors
    const normalizedValue = newValue || [null, null];
    setValue(normalizedValue);
    if (onRangeChange) {
      // Handle different states:
      // 1. Complete range: [Date, Date] - pass it through
      // 2. Partial range (start only): [Date, null] - don't notify parent, keep in local state
      //    This allows Mantine to maintain the partial selection for the second click
      // 3. No selection: null or [null, null] - clear selection
      if (newValue && Array.isArray(newValue)) {
        if (newValue[0] && newValue[1]) {
          // Complete range - both dates selected
          onRangeChange(newValue);
        } else if (newValue[0] && !newValue[1]) {
          // Partial range - just start date selected
          // Don't call onRangeChange - keep it in local state only
          // Mantine will handle showing the start date as selected
          // When user clicks end date, Mantine will return [Date, Date] and we'll notify parent then
        } else {
          // No selection
          onRangeChange(null);
        }
      } else {
        onRangeChange(null);
      }
    }
  };

  // Determine number of columns (months) based on screen size
  const [numberOfColumns, setNumberOfColumns] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1080 ? 3 : 2;
    }
    return 3; // Default to 3 for SSR
  });

  // Determine picker size based on screen size
  const [pickerSize, setPickerSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1080 ? 'xl' : 'md';
    }
    return 'xl'; // Default to xl for SSR
  });

  const [isHydrated, setIsHydrated] = useState(false);

  // Client-side hydration and responsive setup
  useEffect(() => {
    setIsHydrated(true);
    
    const updateResponsive = () => {
      const isDesktop = window.innerWidth >= 1080;
      setNumberOfColumns(isDesktop ? 3 : 2);
      setPickerSize(isDesktop ? 'xl' : 'md');
    };
    
    // Set initial value based on current width
    updateResponsive();
    
    window.addEventListener('resize', updateResponsive);
    return () => window.removeEventListener('resize', updateResponsive);
  }, []);

  // Create default theme if none provided
  const mantineTheme = theme || createTheme({});

  // Get today's date (set to start of day to prevent timezone issues)
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Helper function to get school holiday info (start, end, middle)
  const getSchoolHolidayInfo = useMemo(() => {
    return (date) => {
      for (const holiday of schoolHolidays) {
        // Filter by state if provided
        if (selectedStateId && holiday.stateId && holiday.stateId !== selectedStateId) {
          continue;
        }

        const start = new Date(holiday.startDate);
        const end = new Date(holiday.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        const startTime = start.getTime();
        const endTime = end.getTime();
        const checkTime = checkDate.getTime();

        if (checkTime === startTime) {
          return { isSchoolHoliday: true, isStart: true, isEnd: false, isMiddle: false };
        }
        if (checkTime === endTime) {
          return { isSchoolHoliday: true, isStart: false, isEnd: true, isMiddle: false };
        }
        if (checkTime > startTime && checkTime < endTime) {
          return { isSchoolHoliday: true, isStart: false, isEnd: false, isMiddle: true };
        }
      }
      return { isSchoolHoliday: false, isStart: false, isEnd: false, isMiddle: false };
    };
  }, [schoolHolidays, selectedStateId]);

  // Custom day renderer with holiday highlighting
  const renderDay = useMemo(() => {
    return (date) => {
      const dateObj = date instanceof Date ? date : new Date(date);
      const day = dateObj.getDate();
      
      // Check if it's a public holiday
      const isPubHoliday = isPublicHoliday(dateObj, publicHolidays, selectedStateId);
      
      // Get school holiday info
      const schoolHolInfo = getSchoolHolidayInfo(dateObj);

      // Determine border radius for school holidays
      let borderRadius = '';
      if (schoolHolInfo.isStart) {
        borderRadius = '100px 0 0 100px';
      } else if (schoolHolInfo.isEnd) {
        borderRadius = '0 100px 100px 0';
      } else if (schoolHolInfo.isMiddle) {
        borderRadius = '0';
      }

      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="calendar-day-content">
          {isPubHoliday && (
            <div 
              className="holiday-highlight public-holiday" 
              style={{ 
                position: 'absolute',
                inset: 0,
                backgroundColor: '#FF7433',
                borderRadius: '100px', // Match start/end date highlight shape
                zIndex: 1
              }} 
            />
          )}
          {schoolHolInfo.isSchoolHoliday && !isPubHoliday && (
            <div 
              className="holiday-highlight school-holiday" 
              style={{ 
                position: 'absolute',
                inset: 0,
                backgroundColor: '#FDE2D4',
                borderRadius: borderRadius,
                zIndex: 1
              }} 
            />
          )}
          <span style={{ position: 'relative', zIndex: 2 }} className={`day-number ${isPubHoliday ? 'public-holiday-day' : ''}`}>{day}</span>
        </div>
      );
    };
  }, [publicHolidays, schoolHolidays, selectedStateId, getSchoolHolidayInfo]);

  // Test if Mantine components are available
  if (typeof MantineProvider === 'undefined' || typeof DatePicker === 'undefined') {
    return (
      <div className="calendar-container" style={{padding: '20px', border: '2px solid red', backgroundColor: '#ffebee'}}>
        <p>Error: Mantine components not loaded. MantineProvider: {typeof MantineProvider}, DatePicker: {typeof DatePicker}</p>
      </div>
    );
  }

  try {
    return (
      <MantineProvider theme={mantineTheme}>
        <div className="calendar-container">
          {isHydrated ? (
            <DatePicker
              key={`hydrated-${publicHolidays.length}-${schoolHolidays.length}-${numberOfColumns}-${pickerSize}`}
              type="range"
              value={value}
              onChange={handleChange}
              locale={locale}
              className="calendar-date-picker"
              size={pickerSize}
              numberOfColumns={numberOfColumns}
              columnsToScroll={1}
              renderDay={renderDay}
              minDate={today}
              hideOutsideDates={true}
            />
          ) : (
            <DatePicker
              key={`ssr-${publicHolidays.length}-${schoolHolidays.length}`}
              type="range"
              value={value}
              onChange={handleChange}
              locale={locale}
              className="calendar-date-picker"
              size="xl"
              numberOfColumns={3}
              columnsToScroll={1}
              renderDay={renderDay}
              minDate={today}
              hideOutsideDates={true}
            />
          )}
        </div>
      </MantineProvider>
    );
  } catch (error) {
    return (
      <div className="calendar-container" style={{padding: '20px', border: '2px solid red', backgroundColor: '#ffebee'}}>
        <p>Error rendering calendar: {error?.message}</p>
        <pre style={{fontSize: '12px', overflow: 'auto'}}>{error?.stack}</pre>
      </div>
    );
  }
}

