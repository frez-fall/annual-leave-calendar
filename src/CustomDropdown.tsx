/**
 * Custom Dropdown Component
 * Styled to match flight booking interface design
 */

import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  id: string;
  name: string;
  value: string;
}

export interface CustomDropdownProps {
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isTogglingRef = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ignore if we're in the middle of toggling
      if (isTogglingRef.current) {
        isTogglingRef.current = false;
        return;
      }

      const target = event.target as Node;
      // Don't close if clicking inside the dropdown container, button, or list
      if (
        dropdownRef.current?.contains(target) ||
        buttonRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    if (isOpen) {
      // Use 'click' instead of 'mousedown' to allow scrollbar interaction
      // Delay to avoid immediate closure when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 10);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.name : placeholder;

  const handleToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // Set flag to prevent click outside handler from firing
    isTogglingRef.current = true;
    // Toggle the state - if already open, close it
    setIsOpen(prev => !prev);
    // Reset flag after a short delay
    setTimeout(() => {
      isTogglingRef.current = false;
    }, 100);
  };

  const handleSelect = (optionValue: string, event?: React.MouseEvent | React.TouchEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    onChange(optionValue || null);
    setIsOpen(false);
  };

  return (
    <div className={`custom-dropdown ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`custom-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={(e) => handleToggle(e)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`custom-dropdown-text ${!selectedOption ? 'placeholder' : ''}`}>
          {displayText}
        </span>
        <svg
          className="custom-dropdown-arrow"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          ref={listRef}
          className="custom-dropdown-list" 
          role="listbox"
          onMouseDown={(e) => {
            // Prevent closing when clicking inside the dropdown list (including scrollbar)
            e.stopPropagation();
          }}
          onClick={(e) => {
            // Prevent closing when clicking inside the dropdown list
            e.stopPropagation();
          }}
          onWheel={(e) => {
            // Allow scrolling without closing
            e.stopPropagation();
          }}
        >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`custom-dropdown-option ${value === option.value ? 'selected' : ''}`}
              onClick={(e) => handleSelect(option.value, e)}
              onMouseDown={(e) => { e.stopPropagation(); handleSelect(option.value, e); }}
              onTouchEnd={(e) => { e.stopPropagation(); handleSelect(option.value, e); }}
              role="option"
              aria-selected={value === option.value}
            >
              <span className="custom-dropdown-option-text">{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

