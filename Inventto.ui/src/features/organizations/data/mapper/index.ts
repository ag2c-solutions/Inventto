import type {
  IMember,
  IOrganization,
  OrganizationSettings
} from '../../domain/entities';
import type {
  BusinessScheduleDTO,
  CandidateMemberDTO,
  DayOfWeekDTO,
  OrganizationDTO,
  OrganizationMemberDTO,
  OrganizationSettingsDTO
} from '../dtos';
import { mapSchedule } from '../utils';

export class OrganizationMapper {
  static toDomain(dto: OrganizationDTO): IOrganization {
    const s = dto.settings || {};
    const identity = s.identity || {};
    const operational = s.operational || {};
    const sales = s.sales || {};

    const settings: OrganizationSettings = {
      identity: {
        displayName: identity.display_name || dto.name,
        logoUrl: identity.logo_url
      },
      operational: {
        timezone: operational.timezone || 'America/Sao_Paulo',
        whatsappMain: operational.whatsapp_main || '',
        whatsappSupport: operational.whatsapp_support || undefined
      },
      sales: {
        acceptOrdersOutsideHours: !!sales.accept_orders_outside_hours
      },
      schedule: mapSchedule(s.schedule)
    };

    return {
      id: dto.id,
      ownerId: dto.owner_id,
      name: dto.name,
      slug: dto.slug,
      document: dto.document || undefined,
      settings,
      createdAt: new Date(dto.created_at)
    };
  }

  static toMemberDomain(
    dto: OrganizationMemberDTO,
    currentUserId: string
  ): IMember {
    const profile = dto.profiles;

    return {
      id: dto.id,
      organizationId: dto.organization_id,
      profileId: dto.profile_id,
      status: dto.status,
      name: profile?.full_name || 'Usuário Desconhecido',
      email: profile?.email || 'Sem e-mail',
      avatarUrl: profile?.avatar_url || undefined,
      role: dto.role,
      joinedAt: new Date(dto.created_at),
      isMe: dto.profile_id === currentUserId
    };
  }

  static toCandidateMemberDomain(dto: CandidateMemberDTO): IMember {
    return {
      id: dto.id,
      organizationId: '',
      profileId: dto.id,
      name: dto.full_name,
      email: dto.email,
      avatarUrl: dto.avatar_url || undefined,
      role: 'sales',
      status: 'active',
      joinedAt: new Date(),
      isMe: false
    };
  }

  static toSettingsDTO(
    settings: OrganizationSettings
  ): OrganizationSettingsDTO {
    const schedule: Partial<Record<DayOfWeekDTO, BusinessScheduleDTO>> = {};

    if (settings.schedule) {
      for (const [day, val] of Object.entries(settings.schedule)) {
        schedule[day as DayOfWeekDTO] = {
          is_open: val.isOpen,
          open_time: val.openTime,
          close_time: val.closeTime
        };
      }
    }

    return {
      identity: settings.identity
        ? {
            display_name: settings.identity.displayName,
            logo_url: settings.identity.logoUrl
          }
        : undefined,
      operational: settings.operational
        ? {
            timezone: settings.operational.timezone,
            whatsapp_main: settings.operational.whatsappMain,
            whatsapp_support: settings.operational.whatsappSupport
          }
        : undefined,
      sales: settings.sales
        ? {
            accept_orders_outside_hours: settings.sales.acceptOrdersOutsideHours
          }
        : undefined,
      schedule:
        Object.keys(schedule).length > 0
          ? (schedule as Record<DayOfWeekDTO, BusinessScheduleDTO>)
          : undefined
    };
  }
}
