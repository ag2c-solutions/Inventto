export const ORG_KEYS = {
  all: ['organizations'] as const,
  detail: (orgId: string) => [...ORG_KEYS.all, 'detail', orgId] as const,
  members: (orgId: string) => [...ORG_KEYS.all, 'members', orgId] as const,
  candidates: (orgId: string) => [...ORG_KEYS.all, 'candidates', orgId] as const
};
