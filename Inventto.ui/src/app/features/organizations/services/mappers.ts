import type { BusinessScheduleDTO, DayOfWeek, DayOfWeekDTO, IBusinessSchedule, IMember, IOrganization, OrganizationDTO, OrganizationMemberDTO, OrganizationSettings } from "../types";


const DEFAULT_SCHEDULE: IBusinessSchedule = { isOpen: false, openTime: "", closeTime: "" };
const DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function mapSchedule(dto?: Record<DayOfWeekDTO, BusinessScheduleDTO>): Record<DayOfWeek, IBusinessSchedule> {
  const schedule = {} as Record<DayOfWeek, IBusinessSchedule>;
  
  DAYS.forEach(day => {
    const dayDto = dto?.[day];
    schedule[day] = dayDto ? {
      isOpen: dayDto.is_open,
      openTime: dayDto.open_time || "",
      closeTime: dayDto.close_time || ""
    } : { ...DEFAULT_SCHEDULE };
  });

  return schedule;
}

export const OrganizationMapper = {
  toDomain(dto: OrganizationDTO): IOrganization {
    const s = dto.settings || {} as OrganizationSettings;
    const identity = s.identity || {};
    const operational = s.operational || {};
    const sales = s.sales || {};

    const settings: OrganizationSettings = {
      identity: {
        displayName: identity.display_name || dto.name,
        logoUrl: identity.logo_url
      },
      operational: {
        timezone: operational.timezone || "America/Sao_Paulo",
        whatsappMain: operational.whatsapp_main || "",
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
      createdAt: new Date(dto.created_at),
    };
  },

  toMemberDomain(dto: OrganizationMemberDTO, currentUserId: string): IMember {
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
      
      isMe: dto.profile_id === currentUserId,
      canManage: dto.role === 'owner' || dto.role === 'manager'
    };
  }
};