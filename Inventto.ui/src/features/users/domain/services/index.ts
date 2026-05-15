import { CloudinaryService } from '@/infra/cloudinary';

import { UserAPI } from '../../data/api';
import { getCroppedImg } from '../../presentation/utils/get-cropped-img';
import type { PixelCrop } from '../../presentation/utils/pixel-crop.types';
import type { User, UserOrganizationContext } from '../entities';

export interface UpdateAvatarVariables {
  userId: string;
  imageSrc: string;
  pixelCrop: PixelCrop;
}

export class UserService {
  static async updateAvatar({
    userId,
    imageSrc,
    pixelCrop
  }: UpdateAvatarVariables): Promise<void> {
    if (!userId?.trim()) {
      throw new Error('Usuário não informado.');
    }

    if (!imageSrc?.trim()) {
      throw new Error('Imagem não informada.');
    }

    const croppedFile = await getCroppedImg(imageSrc, pixelCrop);

    if (!croppedFile) {
      throw new Error('Não foi possível processar o recorte da imagem.');
    }

    const { url } = await CloudinaryService.uploadImage(croppedFile);

    if (!url?.trim()) {
      throw new Error('Avatar não informado.');
    }

    await UserAPI.updateAvatar(userId, url);
  }

  static async updatePassword(password: string): Promise<void> {
    if (!password?.trim()) {
      throw new Error('Senha obrigatória.');
    }

    await UserAPI.updatePassword(password);
  }

  static getDefaultOrganization(
    user: User | null | undefined
  ): UserOrganizationContext | null {
    if (!user?.availableOrganizations.length) {
      return null;
    }

    return user.availableOrganizations[0];
  }

  static getOrganizationById(
    user: User | null | undefined,
    organizationId: string | null
  ): UserOrganizationContext | null {
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
  ): UserOrganizationContext {
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
