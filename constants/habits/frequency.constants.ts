export const FREQUENCY_OPTIONS = [
  { value: 'daily' as const,    label: 'Every Day',      description: 'Check in daily' },
  { value: 'weekly' as const,   label: 'Once a Week',    description: 'At least once per week' },
  { value: 'specific' as const, label: 'Specific Days',  description: 'Choose days of the week' },
];

export const DAY_OPTIONS = [
  { value: 0, label: 'Sun', short: 'S' },
  { value: 1, label: 'Mon', short: 'M' },
  { value: 2, label: 'Tue', short: 'T' },
  { value: 3, label: 'Wed', short: 'W' },
  { value: 4, label: 'Thu', short: 'T' },
  { value: 5, label: 'Fri', short: 'F' },
  { value: 6, label: 'Sat', short: 'S' },
];
