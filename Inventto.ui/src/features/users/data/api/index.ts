import { supabase } from '@/infra/supabase';

import type { User } from '../../domain/entities';
import type { UserWithOrganizationDTO } from '../dtos';
import { handleUserError } from '../handlers/error-handler';
import { UserMapper } from '../mappers';
import { SELECT_PROFILE_QUERY } from '../queries';

export class UserAPI {
  static async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(SELECT_PROFILE_QUERY)
      .eq('id', userId)
      .single()
      .overrideTypes<UserWithOrganizationDTO, { merge: false }>();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }

      return handleUserError(error, 'getProfile');
    }

    if (!data) return null;

    return UserMapper.toDomain(data);
  }

  static async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (error) {
      handleUserError(error, 'updateAvatar');
    }
  }

  static async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      handleUserError(error, 'updatePassword');
    }
  }
}
