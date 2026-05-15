import { describe, expect, it } from 'vitest';

import type { DayOfWeek } from '../../domain/entities';
import type { BusinessScheduleDTO, DayOfWeekDTO } from '../dtos';

import { mapSchedule } from './index';

describe('mapSchedule', () => {
  it('deve retornar todos os 7 dias com DEFAULT_SCHEDULE quando dto é undefined', () => {
    const result = mapSchedule(undefined);
    const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    days.forEach((day) => {
      expect(result[day]).toEqual({
        isOpen: false,
        openTime: '',
        closeTime: ''
      });
    });
  });

  it('deve mapear corretamente is_open, open_time e close_time de um dia específico', () => {
    const dto = {
      mon: { is_open: true, open_time: '08:00', close_time: '18:00' }
    } as Record<DayOfWeekDTO, BusinessScheduleDTO>;
    const result = mapSchedule(dto);
    expect(result.mon).toEqual({
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00'
    });
  });

  it('deve usar string vazia para openTime e closeTime quando open_time e close_time são null', () => {
    const dto = {
      tue: { is_open: false, open_time: null, close_time: null }
    } as unknown as Record<DayOfWeekDTO, BusinessScheduleDTO>;
    const result = mapSchedule(dto);
    expect(result.tue).toEqual({ isOpen: false, openTime: '', closeTime: '' });
  });

  it('deve preservar os dias não presentes no DTO com DEFAULT_SCHEDULE', () => {
    const dto = {
      mon: { is_open: true, open_time: '09:00', close_time: '17:00' }
    } as Record<DayOfWeekDTO, BusinessScheduleDTO>;
    const result = mapSchedule(dto);
    const otherDays: DayOfWeek[] = ['tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    otherDays.forEach((day) => {
      expect(result[day]).toEqual({
        isOpen: false,
        openTime: '',
        closeTime: ''
      });
    });
  });
});
