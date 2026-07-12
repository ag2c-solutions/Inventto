import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OrganizationSettings } from '@/features/organizations';

import { StorefrontApi } from '../../data/api';
import { StorefrontPrereqsMissingError } from '../entities';

import { StorefrontService } from './index';

vi.mock('../../data/api');

function buildSettings(
  overrides: Partial<OrganizationSettings> = {}
): OrganizationSettings {
  return {
    identity: { displayName: 'Loja' },
    operational: { timezone: 'America/Sao_Paulo' },
    sales: { acceptOrdersOutsideHours: false },
    schedule: {
      mon: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tue: { isOpen: false, openTime: '', closeTime: '' },
      wed: { isOpen: false, openTime: '', closeTime: '' },
      thu: { isOpen: false, openTime: '', closeTime: '' },
      fri: { isOpen: false, openTime: '', closeTime: '' },
      sat: { isOpen: false, openTime: '', closeTime: '' },
      sun: { isOpen: false, openTime: '', closeTime: '' }
    },
    ...overrides
  };
}

describe('StorefrontService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('unpublish', () => {
    it('should call StorefrontApi.setPublished with published=false', async () => {
      vi.mocked(StorefrontApi.setPublished).mockResolvedValue(undefined);

      await StorefrontService.unpublish('s1');

      expect(StorefrontApi.setPublished).toHaveBeenCalledWith('s1', false);
    });
  });

  describe('getMissingPrereqs', () => {
    it('should return no missing prereqs when everything is set', () => {
      const missing = StorefrontService.getMissingPrereqs({
        catalogId: 'cat-1',
        whatsapp: '11999998888',
        organizationSettings: buildSettings()
      });

      expect(missing).toEqual([]);
    });

    it('should flag catalog as missing when catalogId is absent', () => {
      const missing = StorefrontService.getMissingPrereqs({
        catalogId: undefined,
        whatsapp: '11999998888',
        organizationSettings: buildSettings()
      });

      expect(missing).toContain('catalog');
    });

    it('should flag whatsapp as missing when blank', () => {
      const missing = StorefrontService.getMissingPrereqs({
        catalogId: 'cat-1',
        whatsapp: '   ',
        organizationSettings: buildSettings()
      });

      expect(missing).toContain('whatsapp');
    });

    it('should flag hours as missing when timezone is not set', () => {
      const missing = StorefrontService.getMissingPrereqs({
        catalogId: 'cat-1',
        whatsapp: '11999998888',
        organizationSettings: buildSettings({
          operational: { timezone: '' }
        })
      });

      expect(missing).toContain('hours');
    });

    it('should flag hours as missing when no day is open', () => {
      const missing = StorefrontService.getMissingPrereqs({
        catalogId: 'cat-1',
        whatsapp: '11999998888',
        organizationSettings: buildSettings({
          schedule: {
            mon: { isOpen: false, openTime: '', closeTime: '' },
            tue: { isOpen: false, openTime: '', closeTime: '' },
            wed: { isOpen: false, openTime: '', closeTime: '' },
            thu: { isOpen: false, openTime: '', closeTime: '' },
            fri: { isOpen: false, openTime: '', closeTime: '' },
            sat: { isOpen: false, openTime: '', closeTime: '' },
            sun: { isOpen: false, openTime: '', closeTime: '' }
          }
        })
      });

      expect(missing).toContain('hours');
    });

    it('should flag every prereq as missing when settings are absent', () => {
      const missing = StorefrontService.getMissingPrereqs({});

      expect(missing).toEqual(['catalog', 'whatsapp', 'hours']);
    });
  });

  describe('publish', () => {
    it('should return published=true when the RPC succeeds', async () => {
      vi.mocked(StorefrontApi.publishStorefront).mockResolvedValue(undefined);

      const result = await StorefrontService.publish('s1');

      expect(result).toEqual({ published: true });
    });

    it('should return published=false with the missing prereqs, opening the Dialog instead of throwing', async () => {
      vi.mocked(StorefrontApi.publishStorefront).mockRejectedValue(
        new StorefrontPrereqsMissingError(['whatsapp', 'hours'])
      );

      const result = await StorefrontService.publish('s1');

      expect(result).toEqual({
        published: false,
        missingPrereqs: ['whatsapp', 'hours']
      });
    });

    it('should propagate other errors', async () => {
      vi.mocked(StorefrontApi.publishStorefront).mockRejectedValue(
        new Error('Acesso negado.')
      );

      await expect(StorefrontService.publish('s1')).rejects.toThrow(
        'Acesso negado.'
      );
    });
  });

  describe('remove', () => {
    it('should call StorefrontApi.removeStorefront when the confirmation matches the name', async () => {
      vi.mocked(StorefrontApi.removeStorefront).mockResolvedValue(undefined);

      await StorefrontService.remove('s1', 'Vitrine Ateliê', 'Vitrine Ateliê');

      expect(StorefrontApi.removeStorefront).toHaveBeenCalledWith('s1');
    });

    it('should reject without calling the API when the confirmation does not match', async () => {
      await expect(
        StorefrontService.remove('s1', 'Nome errado', 'Vitrine Ateliê')
      ).rejects.toThrow('Digite o nome exato da vitrine para confirmar.');

      expect(StorefrontApi.removeStorefront).not.toHaveBeenCalled();
    });
  });
});
