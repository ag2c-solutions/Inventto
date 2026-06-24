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
    uploadLogo: vi.fn(),
    lookupCep: vi.fn(),
    createMember: vi.fn(),
    replicateMember: vi.fn(),
    updateMemberRole: vi.fn(),
    updateMemberStatus: vi.fn(),
    deactivate: vi.fn()
  }
}));

const mockOrganization = { id: 'org-1', role: 'owner' } as never;

describe('OrganizationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    it('deve delegar para OrganizationApi.getById com o orgId correto', async () => {
      vi.mocked(OrganizationApi.getById).mockResolvedValue({} as never);
      await OrganizationService.getById(mockOrganization);
      expect(OrganizationApi.getById).toHaveBeenCalledWith('org-1');
    });

    it('deve propagar o erro quando organization é null', async () => {
      await expect(OrganizationService.getById(null)).rejects.toThrow(
        'ID da organização é obrigatório.'
      );
    });
  });

  describe('getMembers', () => {
    it('deve delegar para OrganizationApi.getMembers com orgId e currentUserId', async () => {
      vi.mocked(OrganizationApi.getMembers).mockResolvedValue([]);
      await OrganizationService.getMembers(mockOrganization, 'user-1');
      expect(OrganizationApi.getMembers).toHaveBeenCalledWith(
        'org-1',
        'user-1'
      );
    });

    it('deve lançar erro quando organization é null', async () => {
      await expect(
        OrganizationService.getMembers(null, 'user-1')
      ).rejects.toThrow('ID da organização é obrigatório.');
    });

    it('deve lançar erro quando currentUserId é vazio', async () => {
      await expect(
        OrganizationService.getMembers(mockOrganization, '')
      ).rejects.toThrow('ID do usuário é obrigatório.');
    });

    it('deve lançar erro quando currentUserId é apenas espaços', async () => {
      await expect(
        OrganizationService.getMembers(mockOrganization, '   ')
      ).rejects.toThrow('ID do usuário é obrigatório.');
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
      ).rejects.toThrow('ID da organização é obrigatório.');
    });
  });

  describe('update', () => {
    it('deve delegar para OrganizationApi.update com orgId e o input completo', async () => {
      vi.mocked(OrganizationApi.update).mockResolvedValue(undefined);
      const input = {
        name: 'Nova Empresa',
        document: '12345678000190',
        legalName: 'Empresa LTDA',
        settings: {} as never
      };
      await OrganizationService.update(mockOrganization, input);
      expect(OrganizationApi.update).toHaveBeenCalledWith('org-1', input);
    });

    it('deve propagar o erro quando organization é null', async () => {
      await expect(
        OrganizationService.update(null, {} as never)
      ).rejects.toThrow('ID da organização é obrigatório.');
    });

    it('faz upload da logo e injeta a URL em settings.identity quando há logoFile', async () => {
      vi.mocked(OrganizationApi.uploadLogo).mockResolvedValue(
        'http://cdn/logo.png'
      );
      vi.mocked(OrganizationApi.update).mockResolvedValue(undefined);

      const file = new File(['x'], 'logo.png', { type: 'image/png' });
      const input = {
        name: 'Loja X',
        settings: { identity: { displayName: 'Loja X' } },
        logoFile: file
      } as never;

      await OrganizationService.update(mockOrganization, input);

      expect(OrganizationApi.uploadLogo).toHaveBeenCalledWith(file);
      expect(OrganizationApi.update).toHaveBeenCalledWith('org-1', {
        name: 'Loja X',
        settings: {
          identity: { displayName: 'Loja X', logoUrl: 'http://cdn/logo.png' }
        }
      });
    });

    it('não chama uploadLogo quando não há logoFile', async () => {
      vi.mocked(OrganizationApi.update).mockResolvedValue(undefined);
      const input = {
        name: 'Loja X',
        settings: { identity: { displayName: 'Loja X' } }
      } as never;

      await OrganizationService.update(mockOrganization, input);

      expect(OrganizationApi.uploadLogo).not.toHaveBeenCalled();
      expect(OrganizationApi.update).toHaveBeenCalledWith('org-1', input);
    });
  });

  describe('lookupCep', () => {
    it('deve delegar para OrganizationApi.lookupCep', async () => {
      const address = {
        zip: '01310-100',
        street: 'Av. Paulista',
        number: '',
        district: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP'
      };
      vi.mocked(OrganizationApi.lookupCep).mockResolvedValue(address);

      const result = await OrganizationService.lookupCep('01310100');

      expect(OrganizationApi.lookupCep).toHaveBeenCalledWith('01310100');
      expect(result).toEqual(address);
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
      ).rejects.toThrow('ID da organização é obrigatório.');
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
      ).rejects.toThrow('ID da organização é obrigatório.');
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

  describe('deactivate', () => {
    it('deve resolver o orgId e delegar para OrganizationApi.deactivate', async () => {
      vi.mocked(OrganizationApi.deactivate).mockResolvedValue(undefined);
      await OrganizationService.deactivate(mockOrganization);
      expect(OrganizationApi.deactivate).toHaveBeenCalledWith('org-1');
    });

    it('deve propagar o erro quando organization é null', async () => {
      await expect(OrganizationService.deactivate(null)).rejects.toThrow(
        'ID da organização é obrigatório.'
      );
    });
  });
});
