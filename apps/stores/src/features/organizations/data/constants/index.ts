import type { DayOfWeek, IBusinessSchedule } from '../../domain/entities';

export const DEFAULT_SCHEDULE: IBusinessSchedule = {
  isOpen: false,
  openTime: '',
  closeTime: ''
};
export const DAYS: DayOfWeek[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun'
];
