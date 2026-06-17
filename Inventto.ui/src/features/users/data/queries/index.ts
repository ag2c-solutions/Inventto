export const SELECT_PROFILE_QUERY = `
  id,
  email,
  full_name,
  avatar_url,
  must_change_password,
  created_at,
  updated_at,
  organization_members (
    role,
    organization_id,
    organizations (
      id,
      name
    )
  )
`;
