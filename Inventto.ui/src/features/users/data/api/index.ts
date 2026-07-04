import { CloudinaryService } from '@/infra/cloudinary';
import { supabase } from '@/infra/supabase';

import type { UpdatePasswordVariables, User } from '../../domain/entities';
// eslint-disable-next-line boundaries/dependencies -- TODO: essa tradução de erro deveria acontecer em handleUserError (data/handlers), não via classe de domain/errors lançada direto na API
import { CurrentPasswordInvalidError } from '../../domain/errors';
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

  static async updatePassword({
    currentPassword,
    newPassword
  }: UpdatePasswordVariables): Promise<void> {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      handleUserError(
        userError || new Error('Usuário não encontrado'),
        'updatePassword'
      );
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email as string,
      password: currentPassword
    });

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        throw new CurrentPasswordInvalidError();
      }
      handleUserError(signInError, 'updatePassword');
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      handleUserError(updateError, 'updatePassword');
    }
  }

  static async saveProfileImage(file: File): Promise<string> {
    try {
      const { url } = await CloudinaryService.uploadImage(file);

      return url;
    } catch (error) {
      handleUserError(error, 'saveProfileImage');
    }
  }
}
