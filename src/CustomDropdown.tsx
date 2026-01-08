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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Use capture phase to catch events before Webflow handlers
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('click', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('click', handleClickOutside, true);
    };
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

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Immediately call onChange and close dropdown
    const valueToSet = optionValue || null;
    onChange(valueToSet);
    // Use requestAnimationFrame to ensure state updates are processed
    requestAnimationFrame(() => {
      setIsOpen(false);
    });
  };

  return (
    <div className={`custom-dropdown ${className}`} ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={`custom-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
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
        <div className="custom-dropdown-list" role="listbox">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`custom-dropdown-option ${value === option.value ? 'selected' : ''}`}
              onClick={(e) => handleSelect(option.value, e)}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(option.value, e as any);
              }}
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

