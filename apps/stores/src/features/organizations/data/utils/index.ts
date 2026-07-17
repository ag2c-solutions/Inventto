import type { DayOfWeek, IBusinessSchedule } from '../../domain/entities';
import { DAYS, DEFAULT_SCHEDULE } from '../constants';
import type { BusinessScheduleDTO, DayOfWeekDTO } from '../dtos';

export function mapSchedule(
  dto?: Record<DayOfWeekDTO, BusinessScheduleDTO>
): Record<DayOfWeek, IBusinessSchedule> {
  const schedule = {} as Record<DayOfWeek, IBusinessSchedule>;

  DAYS.forEach((day) => {
    const dayDto = dto?.[day];
    schedule[day] = dayDto
      ? {
          isOpen: dayDto.is_open,
          openTime: dayDto.open_time || '',
          closeTime: dayDto.close_time || ''
        }
      : { ...DEFAULT_SCHEDULE };
  });

  return schedule;
}
