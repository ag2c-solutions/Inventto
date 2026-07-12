import { describe, expect, it, vi } from 'vitest';

import { StorefrontApi } from '../../data/api';

import { StorefrontService } from './index';

vi.mock('../../data/api');

describe('StorefrontService', () => {
  describe('unpublish', () => {
    it('should call StorefrontApi.setPublished with published=false', async () => {
      vi.mocked(StorefrontApi.setPublished).mockResolvedValue(undefined);

      await StorefrontService.unpublish('s1');

      expect(StorefrontApi.setPublished).toHaveBeenCalledWith('s1', false);
    });
  });
});
