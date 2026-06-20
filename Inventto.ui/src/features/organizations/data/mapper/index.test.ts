import { describe, expect, it } from 'vitest';

import type { OrganizationSettings } from '../../domain/entities';
import type {
  CandidateMemberDTO,
  OrganizationDTO,
  OrganizationMemberDTO
} from '../dtos';

import { OrganizationMapper } from './index';

describe('OrganizationMapper', () => {
  describe('toDomain', () => {
    const baseDto: OrganizationDTO = {
      id: 'org-1',
      owner_id: 'owner-1',
      name: 'Minha Empresa',
      document: '12.345.678/0001-90',
      settings: {
        identity: { display_name: 'Empresa Display', logo_url: 'logo.png' },
        operational: {
          timezone: 'America/Recife',
          whatsapp_main: '81999999999'
        },
        sales: { accept_orders_outside_hours: true }
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    it('deve mapear corretamente todos os campos escalares', () => {
      const result = OrganizationMapper.toDomain(baseDto);
      expect(result.id).toBe('org-1');
      expect(result.ownerId).toBe('owner-1');
      expect(result.name).toBe('Minha Empresa');
      expect(result.document).toBe('12.345.678/0001-90');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('deve usar dto.name como displayName quando identity.display_name está ausente', () => {
      const dto: OrganizationDTO = { ...baseDto, settings: {} };
      const result = OrganizationMapper.toDomain(dto);
      expect(result.settings.identity.displayName).toBe('Minha Empresa');
    });

    it('deve usar America/Sao_Paulo como timezone padrão quando ausente', () => {
      const dto: OrganizationDTO = { ...baseDto, settings: {} };
      const result = OrganizationMapper.toDomain(dto);
      expect(result.settings.operational.timezone).toBe('America/Sao_Paulo');
    });

    it('deve mapear o schedule via mapSchedule', () => {
      const dto: OrganizationDTO = { ...baseDto, settings: {} };
      const result = OrganizationMapper.toDomain(dto);
      const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      days.forEach((day) => {
        expect(
          result.settings.schedule[day as keyof typeof result.settings.schedule]
        ).toBeDefined();
      });
    });

    it('deve retornar document como undefined quando null no DTO', () => {
      const dto: OrganizationDTO = { ...baseDto, document: null };
      const result = OrganizationMapper.toDomain(dto);
      expect(result.document).toBeUndefined();
    });
  });

  describe('toMemberDomain', () => {
    const baseMemberDto: OrganizationMemberDTO = {
      id: 'member-1',
      organization_id: 'org-1',
      profile_id: 'profile-1',
      role: 'sales',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      profiles: {
        id: 'profile-1',
        full_name: 'João Silva',
        email: 'joao@email.com',
        avatar_url: 'avatar.jpg'
      }
    };

    it('deve mapear corretamente todos os campos', () => {
      const result = OrganizationMapper.toMemberDomain(
        baseMemberDto,
        'other-user'
      );
      expect(result.id).toBe('member-1');
      expect(result.organizationId).toBe('org-1');
      expect(result.profileId).toBe('profile-1');
      expect(result.name).toBe('João Silva');
      expect(result.email).toBe('joao@email.com');
      expect(result.avatarUrl).toBe('avatar.jpg');
      expect(result.role).toBe('sales');
      expect(result.status).toBe('active');
      expect(result.joinedAt).toBeInstanceOf(Date);
    });

    it('deve definir isMe como true quando profile_id === currentUserId', () => {
      const result = OrganizationMapper.toMemberDomain(
        baseMemberDto,
        'profile-1'
      );
      expect(result.isMe).toBe(true);
    });

    it('deve usar fallback "Usuário Desconhecido" e "Sem e-mail" quando profiles é null', () => {
      const dto: OrganizationMemberDTO = { ...baseMemberDto, profiles: null };
      const result = OrganizationMapper.toMemberDomain(dto, 'other');
      expect(result.name).toBe('Usuário Desconhecido');
      expect(result.email).toBe('Sem e-mail');
      expect(result.avatarUrl).toBeUndefined();
    });
  });

  describe('toCandidateMemberDomain', () => {
    const baseCandidateDto: CandidateMemberDTO = {
      id: 'candidate-1',
      full_name: 'Maria Santos',
      email: 'maria@email.com',
      avatar_url: 'avatar-maria.jpg'
    };

    it('deve mapear corretamente os campos básicos', () => {
      const result =
        OrganizationMapper.toCandidateMemberDomain(baseCandidateDto);
      expect(result.profileId).toBe('candidate-1');
      expect(result.name).toBe('Maria Santos');
      expect(result.email).toBe('maria@email.com');
      expect(result.avatarUrl).toBe('avatar-maria.jpg');
    });

    it('deve definir role fixo como sales', () => {
      const result =
        OrganizationMapper.toCandidateMemberDomain(baseCandidateDto);
      expect(result.role).toBe('sales');
    });

    it('deve definir status fixo como active', () => {
      const result =
        OrganizationMapper.toCandidateMemberDomain(baseCandidateDto);
      expect(result.status).toBe('active');
    });

    it('deve definir isMe sempre como false', () => {
      const result =
        OrganizationMapper.toCandidateMemberDomain(baseCandidateDto);
      expect(result.isMe).toBe(false);
    });
  });

  describe('toSettingsDTO', () => {
    const settings: OrganizationSettings = {
      identity: { displayName: 'Empresa X', logoUrl: 'logo.png' },
      operational: {
        timezone: 'America/Recife',
        whatsappMain: '81999999999',
        whatsappSupport: '81888888888'
      },
      sales: { acceptOrdersOutsideHours: true },
      schedule: {
        mon: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
        tue: { isOpen: false, openTime: '', closeTime: '' },
        wed: { isOpen: false, openTime: '', closeTime: '' },
        thu: { isOpen: false, openTime: '', closeTime: '' },
        fri: { isOpen: false, openTime: '', closeTime: '' },
        sat: { isOpen: false, openTime: '', closeTime: '' },
        sun: { isOpen: false, openTime: '', closeTime: '' }
      }
    };

    it('deve converter corretamente camelCase para snake_case em todos os campos', () => {
      const result = OrganizationMapper.toSettingsDTO(settings);
      expect(result.identity).toEqual({
        display_name: 'Empresa X',
        logo_url: 'logo.png'
      });
      expect(result.operational).toEqual({
        timezone: 'America/Recife',
        whatsapp_main: '81999999999',
        whatsapp_support: '81888888888'
      });
      expect(result.sales).toEqual({ accept_orders_outside_hours: true });
    });

    it('deve mapear schedule com is_open, open_time e close_time corretamente', () => {
      const result = OrganizationMapper.toSettingsDTO(settings);
      expect(result.schedule?.mon).toEqual({
        is_open: true,
        open_time: '08:00',
        close_time: '18:00'
      });
    });
  });
});
