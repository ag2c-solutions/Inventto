import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganizationApi } from '../../data/api';

import { OrganizationService } from './index';

vi.mock('../../data/api', () => ({
  OrganizationApi: {
    getById: vi.fn(),
    getMembers: vi.fn(),
    getCandidatesMembers: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    createMember: vi.fn(),
    replicateMember: vi.fn(),
    updateMemberRole: vi.fn(),
    updateMemberStatus: vi.fn(),
    forceDeleteMember: vi.fn()
  }
}));

const mockOrganization = { id: 'org-1', role: 'owner' } as never;

describe('OrganizationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrganizationId (via métodos públicos)', () => {
    it('deve lançar "Organization ID is required" quando organization é null', async () => {
      await expect(OrganizationService.getById(null)).rejects.toThrow(
        'Organization ID is required'
      );
    });

    it('deve lançar quando organization.id é string vazia', async () => {
      await expect(
        OrganizationService.getById({ id: '', role: 'owner' } as never)
      ).rejects.toThrow('Organization ID is required');
    });
  });

  describe('getById', () => {
    it('deve delegar para OrganizationApi.getById com o orgId correto', async () => {
      vi.mocked(OrganizationApi.getById).mockResolvedValue({} as never);
      await OrganizationService.getById(mockOrganization);
      expect(OrganizationApi.getById).toHaveBeenCalledWith('org-1');
    });

    it('deve propagar o erro quando organization é null', async () => {
      await expect(OrganizationService.getById(null)).rejects.toThrow(
        'Organization ID is required'
      );
    });
  });

  describe('getMembers', () => {
    it('deve delegar para OrganizationApi.getMembers com o orgId correto', async () => {
      vi.mocked(OrganizationApi.getMembers).mockResolvedValue([]);
      await OrganizationService.getMembers(mockOrganization);
      expect(OrganizationApi.getMembers).toHaveBeenCalledWith('org-1');
    });

    it('deve propagar o erro quando organization é null', async () => {
      await expect(OrganizationService.getMembers(null)).rejects.toThrow(
        'Organization ID is required'
      );
    });
  });

  describe('getCandidatesMembers', () => {
    it('deve delegar para OrganizationApi.getCandidatesMembers com o orgId correto', async () => {
      vi.mocked(OrganizationApi.getCandidatesMembers).mockResolvedValue([]);
      await OrganizationService.getCandidatesMembers(mockOrganization);
      expect(OrganizationApi.getCandidatesMembers).toHaveBeenCalledWith(
        'org-1'
      );
    });

    it('deve propagar o erro quando organization é null', async () => {
      await expect(
        OrganizationService.getCandidatesMembers(null)
      ).rejects.toThrow('Organization ID is required');
    });
  });

  describe('update', () => {
    it('deve delegar para OrganizationApi.update com o orgId correto', async () => {
      vi.mocked(OrganizationApi.update).mockResolvedValue(undefined);
      const settings = {} as never;
      await OrganizationService.update(mockOrganization, settings);
      expect(OrganizationApi.update).toHaveBeenCalledWith('org-1', {
        settings
      });
    });

    it('deve propagar o erro quando organization é null', async () => {
      await expect(
        OrganizationService.update(null, {} as never)
      ).rejects.toThrow('Organization ID is required');
    });
  });

  describe('createMember', () => {
    it('deve delegar para OrganizationApi.createMember com o orgId correto', async () => {
      vi.mocked(OrganizationApi.createMember).mockResolvedValue(undefined);
      const data = {
        name: 'João',
        email: 'joao@email.com',
        role: 'sales' as const,
        password: '123456'
      };
      await OrganizationService.createMember(mockOrganization, data);
      expect(OrganizationApi.createMember).toHaveBeenCalledWith('org-1', data);
    });

    it('deve propagar o erro quando organization é null', async () => {
      await expect(
        OrganizationService.createMember(null, {} as never)
      ).rejects.toThrow('Organization ID is required');
    });
  });

  describe('replicateMember', () => {
    it('deve delegar para OrganizationApi.replicateMember com o orgId correto', async () => {
      vi.mocked(OrganizationApi.replicateMember).mockResolvedValue(undefined);
      await OrganizationService.replicateMember(
        mockOrganization,
        'user-2',
        'manager'
      );
      expect(OrganizationApi.replicateMember).toHaveBeenCalledWith(
        'org-1',
        'user-2',
        'manager'
      );
    });

    it('deve propagar o erro quando organization é null', async () => {
      await expect(
        OrganizationService.replicateMember(null, 'user-2', 'manager')
      ).rejects.toThrow('Organization ID is required');
    });
  });

  describe('updateMemberRole', () => {
    it('deve delegar para OrganizationApi.updateMemberRole com os parâmetros corretos', async () => {
      vi.mocked(OrganizationApi.updateMemberRole).mockResolvedValue(undefined);
      await OrganizationService.updateMemberRole('member-1', 'manager');
      expect(OrganizationApi.updateMemberRole).toHaveBeenCalledWith(
        'member-1',
        'manager'
      );
    });
  });

  describe('updateMemberStatus', () => {
    it('deve delegar para OrganizationApi.updateMemberStatus com os parâmetros corretos', async () => {
      vi.mocked(OrganizationApi.updateMemberStatus).mockResolvedValue(
        undefined
      );
      await OrganizationService.updateMemberStatus('member-1', 'inactive');
      expect(OrganizationApi.updateMemberStatus).toHaveBeenCalledWith(
        'member-1',
        'inactive'
      );
    });
  });

  describe('forceDeleteMember', () => {
    it('deve delegar para OrganizationApi.forceDeleteMember com os parâmetros corretos', async () => {
      vi.mocked(OrganizationApi.forceDeleteMember).mockResolvedValue(undefined);
      await OrganizationService.forceDeleteMember('member-1');
      expect(OrganizationApi.forceDeleteMember).toHaveBeenCalledWith(
        'member-1'
      );
    });
  });
});
