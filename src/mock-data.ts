/**
 * Mock data for testing Calendar component
 * Simulates Webflow CMS collections data
 */

export const mockPublicHolidays = [
  {
    id: 'ph1',
    date: new Date('2025-01-01'),
    name: 'New Year\'s Day',
    stateIds: ['state1', 'state2'],
  },
  {
    id: 'ph2',
    date: new Date('2025-01-26'),
    name: 'Australia Day',
    stateIds: ['state1'],
  },
  {
    id: 'ph3',
    date: new Date('2025-03-17'),
    name: 'St. Patrick\'s Day',
    stateIds: ['state2'],
  },
  {
    id: 'ph4',
    date: new Date('2025-04-25'),
    name: 'ANZAC Day',
    stateIds: ['state1', 'state2'],
  },
  {
    id: 'ph5',
    date: new Date('2025-12-25'),
    name: 'Christmas Day',
    stateIds: ['state1', 'state2'],
  },
  {
    id: 'ph6',
    date: new Date('2025-12-26'),
    name: 'Boxing Day',
    stateIds: ['state1', 'state2'],
  },
];

export const mockSchoolHolidays = [
  {
    id: 'sh1',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-01-31'),
    name: 'Summer Holidays',
    stateId: 'state1',
  },
  {
    id: 'sh2',
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-02-05'),
    name: 'Summer Holidays',
    stateId: 'state2',
  },
  {
    id: 'sh3',
    startDate: new Date('2025-04-10'),
    endDate: new Date('2025-04-27'),
    name: 'Easter Holidays',
    stateId: 'state1',
  },
  {
    id: 'sh4',
    startDate: new Date('2025-04-12'),
    endDate: new Date('2025-04-28'),
    name: 'Easter Holidays',
    stateId: 'state2',
  },
  {
    id: 'sh5',
    startDate: new Date('2025-07-05'),
    endDate: new Date('2025-07-20'),
    name: 'Winter Holidays',
    stateId: 'state1',
  },
  {
    id: 'sh6',
    startDate: new Date('2025-07-10'),
    endDate: new Date('2025-07-25'),
    name: 'Winter Holidays',
    stateId: 'state2',
  },
  {
    id: 'sh7',
    startDate: new Date('2025-09-20'),
    endDate: new Date('2025-10-06'),
    name: 'Spring Holidays',
    stateId: 'state1',
  },
  {
    id: 'sh8',
    startDate: new Date('2025-09-25'),
    endDate: new Date('2025-10-10'),
    name: 'Spring Holidays',
    stateId: 'state2',
  },
  {
    id: 'sh9',
    startDate: new Date('2025-12-15'),
    endDate: new Date('2026-01-31'),
    name: 'Summer Holidays',
    stateId: 'state1',
  },
  {
    id: 'sh10',
    startDate: new Date('2025-12-20'),
    endDate: new Date('2026-02-05'),
    name: 'Summer Holidays',
    stateId: 'state2',
  },
];

export const mockStates = [
  {
    id: 'state1',
    name: 'New South Wales',
    slug: 'nsw',
    abbreviation: 'NSW',
  },
  {
    id: 'state2',
    name: 'Victoria',
    slug: 'vic',
    abbreviation: 'VIC',
  },
];

/**
 * Simulate API delay
 */
export function delay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}



