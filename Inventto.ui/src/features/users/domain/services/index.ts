import { UserAPI } from '../../data/api';
import type {
  UpdateAvatarVariables,
  UpdatePasswordVariables,
  User,
  UserOrganization
} from '../entities';

export class UserService {
  static async getProfile(userId: string): Promise<User> {
    if (!userId?.trim()) {
      throw new Error('ID do usuário é obrigatório.');
    }

    const profile = await UserAPI.getProfile(userId);

    if (!profile) {
      throw new Error('Usuário não encontrado.');
    }

    return profile;
  }

  static async updateAvatar({
    userId,
    file
  }: UpdateAvatarVariables): Promise<void> {
    if (!userId?.trim()) {
      throw new Error('Usuário não informado.');
    }

    if (!file) {
      throw new Error('Imagem não informada.');
    }

    const url = await UserAPI.saveProfileImage(file);

    await UserAPI.updateAvatar(userId, url);
  }

  static async updatePassword({
    currentPassword,
    newPassword
  }: UpdatePasswordVariables): Promise<void> {
    if (!currentPassword?.trim()) {
      throw new Error('Senha atual obrigatória.');
    }

    if (!newPassword?.trim()) {
      throw new Error('Nova senha obrigatória.');
    }

    await UserAPI.updatePassword({ currentPassword, newPassword });
  }

  static getDefaultOrganization(
    user: User | null | undefined
  ): UserOrganization | null {
    if (!user?.availableOrganizations.length) {
      return null;
    }

    return user.availableOrganizations[0];
  }

  static getOrganizationById(
    user: User | null | undefined,
    organizationId: string | null
  ): UserOrganization | null {
    if (!user?.availableOrganizations.length) {
      return null;
    }

    if (!organizationId?.trim()) {
      return this.getDefaultOrganization(user);
    }

    return (
      user.availableOrganizations.find(
        (organization) => organization.id === organizationId
      ) ?? this.getDefaultOrganization(user)
    );
  }

  static selectOrganization(
    user: User | null | undefined,
    organizationId: string
  ): UserOrganization {
    if (!user) {
      throw new Error('Usuário não carregado.');
    }

    if (!organizationId?.trim()) {
      throw new Error('Organização não informada.');
    }

    const organization = user.availableOrganizations.find(
      (item) => item.id === organizationId
    );

    if (!organization) {
      throw new Error('Usuário não pertence à organização selecionada.');
    }

    return organization;
  }

  static isOrganizationMember(
    user: User | null | undefined,
    organizationId: string | null
  ): boolean {
    if (!user || !organizationId?.trim()) {
      return false;
    }

    return user.availableOrganizations.some(
      (organization) => organization.id === organizationId
    );
  }
}
