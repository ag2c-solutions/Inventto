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

  describe('save', () => {
    const payload = {
      organizationId: 'org-1',
      name: 'Vitrine Ateliê Joana',
      slug: 'atelie-joana'
    };

    it('should call createStorefront when no id is given', async () => {
      vi.mocked(StorefrontApi.createStorefront).mockResolvedValue('new-id');

      const result = await StorefrontService.save(payload);

      expect(StorefrontApi.createStorefront).toHaveBeenCalledWith(payload);
      expect(result).toBe('new-id');
    });

    it('should call updateStorefront when an id is given', async () => {
      vi.mocked(StorefrontApi.updateStorefront).mockResolvedValue(undefined);

      const result = await StorefrontService.save(payload, 's1');

      expect(StorefrontApi.updateStorefront).toHaveBeenCalledWith({
        id: 's1',
        ...payload
      });
      expect(result).toBe('s1');
      expect(StorefrontApi.createStorefront).not.toHaveBeenCalled();
    });
  });

  describe('uploadThemeAssets', () => {
    const colors = {
      primary: '#3A3631',
      background: '#F7F5F2',
      secondary: '#8B857D',
      text: '#2C2A28'
    };

    it('should upload the logo/cover files when raw File objects are given', async () => {
      const logoFile = new File(['logo'], 'logo.png', { type: 'image/png' });
      const coverFile = new File(['cover'], 'cover.png', {
        type: 'image/png'
      });
      vi.mocked(StorefrontApi.uploadLogo).mockResolvedValue(
        'https://cdn.test/logo.png'
      );
      vi.mocked(StorefrontApi.uploadCover).mockResolvedValue(
        'https://cdn.test/cover.png'
      );

      const result = await StorefrontService.uploadThemeAssets({
        colors,
        logoFile,
        coverFile,
        layout: 'grid',
        cardStyle: 'minimal-large-image'
      });

      expect(StorefrontApi.uploadLogo).toHaveBeenCalledWith(logoFile);
      expect(StorefrontApi.uploadCover).toHaveBeenCalledWith(coverFile);
      expect(result).toEqual({
        colors,
        logoUrl: 'https://cdn.test/logo.png',
        coverUrl: 'https://cdn.test/cover.png',
        layout: 'grid',
        cardStyle: 'minimal-large-image'
      });
    });

    it('should keep the existing URLs and skip upload when no new file is given', async () => {
      const result = await StorefrontService.uploadThemeAssets({
        colors,
        logoUrl: 'https://cdn.test/existing-logo.png',
        coverUrl: 'https://cdn.test/existing-cover.png',
        layout: 'list',
        cardStyle: 'minimal-large-image'
      });

      expect(StorefrontApi.uploadLogo).not.toHaveBeenCalled();
      expect(StorefrontApi.uploadCover).not.toHaveBeenCalled();
      expect(result).toEqual({
        colors,
        logoUrl: 'https://cdn.test/existing-logo.png',
        coverUrl: 'https://cdn.test/existing-cover.png',
        layout: 'list',
        cardStyle: 'minimal-large-image'
      });
    });
  });

  describe('save with theme', () => {
    const colors = {
      primary: '#3A3631',
      background: '#F7F5F2',
      secondary: '#8B857D',
      text: '#2C2A28'
    };

    it('should upload theme assets before updating the storefront', async () => {
      const logoFile = new File(['logo'], 'logo.png', { type: 'image/png' });
      vi.mocked(StorefrontApi.uploadLogo).mockResolvedValue(
        'https://cdn.test/logo.png'
      );
      vi.mocked(StorefrontApi.updateStorefront).mockResolvedValue(undefined);

      await StorefrontService.save(
        {
          organizationId: 'org-1',
          name: 'Vitrine Ateliê Joana',
          theme: {
            colors,
            logoFile,
            layout: 'grid',
            cardStyle: 'minimal-large-image'
          }
        },
        's1'
      );

      expect(StorefrontApi.uploadLogo).toHaveBeenCalledWith(logoFile);
      expect(StorefrontApi.updateStorefront).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 's1',
          theme: {
            colors,
            logoUrl: 'https://cdn.test/logo.png',
            coverUrl: undefined,
            layout: 'grid',
            cardStyle: 'minimal-large-image'
          }
        })
      );
    });

    it('should save without a theme block when none is given', async () => {
      vi.mocked(StorefrontApi.createStorefront).mockResolvedValue('new-id');

      await StorefrontService.save({
        organizationId: 'org-1',
        name: 'Vitrine Ateliê Joana'
      });

      expect(StorefrontApi.uploadLogo).not.toHaveBeenCalled();
      expect(StorefrontApi.uploadCover).not.toHaveBeenCalled();
      expect(StorefrontApi.createStorefront).toHaveBeenCalledWith(
        expect.objectContaining({ theme: undefined })
      );
    });
  });
});
