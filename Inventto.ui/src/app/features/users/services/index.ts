import { supabase } from '@/app/config/supabase';
import { handleUserError } from './error-handler';
import { UserMapper } from './mappers';
import type { User, UserWithOrganizationDTO } from '../types';

const SELECT_FULL_PROFILE_QUERY = `
  id,
  full_name,
  email,
  avatar_url,
  created_at,
  updated_at,
  organization_members (
    role,
    organization_id,
    organizations (
      id,
      name,
      slug
    )
  )
`;

async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(SELECT_FULL_PROFILE_QUERY)
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    return handleUserError(error, 'getProfile');
  }

  if (!data) return null;

  return UserMapper.toDomain(data as unknown as UserWithOrganizationDTO);
}

async function updateAvatar(userId: string, avatarUrl: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) handleUserError(error, 'updateAvatar');
}

async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password
  });

  if (error) handleUserError(error, 'updatePassword');
}

export const UserService = {
  getProfile,
  updateAvatar,
  updatePassword
};
