import { beforeEach, describe, expect, it, vi } from 'vitest';

import { uploadImageToCloudinary } from '@/shared/services/image-upload';
import { getCroppedImg, type PixelCrop } from '@/shared/utils';

import { UserAPI } from '../../data/api';
import type { User } from '../entities';

import { UserService } from './index';

vi.mock('@/shared/services/image-upload', () => ({
  uploadImageToCloudinary: vi.fn()
}));

vi.mock('@/shared/utils', () => ({
  getCroppedImg: vi.fn()
}));

vi.mock('../../data/api', () => ({
  UserAPI: {
    updateAvatar: vi.fn(),
    updatePassword: vi.fn()
  }
}));

const mockGetCroppedImg = vi.mocked(getCroppedImg);
const mockUploadImageToCloudinary = vi.mocked(uploadImageToCloudinary);
const mockUpdateAvatar = vi.mocked(UserAPI.updateAvatar);
const mockUpdatePassword = vi.mocked(UserAPI.updatePassword);

const user: User = {
  id: 'user-123',
  email: 'rafael@test.com',
  fullName: 'Rafael Conceição',
  avatarUrl: 'https://cdn.example.com/avatar.png',
  mustChangePassword: false,
  createdAt: new Date('2026-05-04T10:00:00.000Z'),
  updatedAt: new Date('2026-05-04T12:00:00.000Z'),
  availableOrganizations: [
    {
      id: 'organization-123',
      name: 'Inventto',
      slug: 'inventto',
      role: 'owner'
    },
    {
      id: 'organization-456',
      name: 'Smart Tech',
      slug: 'smart-tech',
      role: 'manager'
    }
  ]
};

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateAvatar', () => {
    const userId = 'user-123';
    const imageSrc = 'data:image/png;base64,image';

    const pixelCrop: PixelCrop = {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    };

    const croppedFile = {
      name: 'avatar.png',
      type: 'image/png'
    } as File;

    it('should crop image, upload it and update avatar successfully', async () => {
      mockGetCroppedImg.mockResolvedValue(croppedFile);
      mockUploadImageToCloudinary.mockResolvedValue({
        url: 'https://cdn.example.com/avatar.png',
        publicId: 'avatar-public-id'
      });
      mockUpdateAvatar.mockResolvedValue();

      await UserService.updateAvatar({
        userId,
        imageSrc,
        pixelCrop
      });

      expect(mockGetCroppedImg).toHaveBeenCalledWith(imageSrc, pixelCrop);
      expect(mockUploadImageToCloudinary).toHaveBeenCalledWith(croppedFile);
      expect(mockUpdateAvatar).toHaveBeenCalledWith(
        userId,
        'https://cdn.example.com/avatar.png'
      );
    });

    it('should throw when user id is empty', async () => {
      await expect(
        UserService.updateAvatar({
          userId: '   ',
          imageSrc,
          pixelCrop
        })
      ).rejects.toThrow('Usuário não informado.');

      expect(mockGetCroppedImg).not.toHaveBeenCalled();
      expect(mockUploadImageToCloudinary).not.toHaveBeenCalled();
      expect(mockUpdateAvatar).not.toHaveBeenCalled();
    });

    it('should throw when image src is empty', async () => {
      await expect(
        UserService.updateAvatar({
          userId,
          imageSrc: '   ',
          pixelCrop
        })
      ).rejects.toThrow('Imagem não informada.');

      expect(mockGetCroppedImg).not.toHaveBeenCalled();
      expect(mockUploadImageToCloudinary).not.toHaveBeenCalled();
      expect(mockUpdateAvatar).not.toHaveBeenCalled();
    });

    it('should throw when cropped image cannot be generated', async () => {
      mockGetCroppedImg.mockResolvedValue(null);

      await expect(
        UserService.updateAvatar({
          userId,
          imageSrc,
          pixelCrop
        })
      ).rejects.toThrow('Não foi possível processar o recorte da imagem.');

      expect(mockGetCroppedImg).toHaveBeenCalledWith(imageSrc, pixelCrop);
      expect(mockUploadImageToCloudinary).not.toHaveBeenCalled();
      expect(mockUpdateAvatar).not.toHaveBeenCalled();
    });

    it('should throw when uploaded avatar url is empty', async () => {
      mockGetCroppedImg.mockResolvedValue(croppedFile);
      mockUploadImageToCloudinary.mockResolvedValue({
        url: '',
        publicId: 'avatar-public-id'
      });

      await expect(
        UserService.updateAvatar({
          userId,
          imageSrc,
          pixelCrop
        })
      ).rejects.toThrow('Avatar não informado.');

      expect(mockGetCroppedImg).toHaveBeenCalledWith(imageSrc, pixelCrop);
      expect(mockUploadImageToCloudinary).toHaveBeenCalledWith(croppedFile);
      expect(mockUpdateAvatar).not.toHaveBeenCalled();
    });

    it('should propagate image upload errors', async () => {
      mockGetCroppedImg.mockResolvedValue(croppedFile);
      mockUploadImageToCloudinary.mockRejectedValue(
        new Error('Erro ao fazer upload da imagem.')
      );

      await expect(
        UserService.updateAvatar({
          userId,
          imageSrc,
          pixelCrop
        })
      ).rejects.toThrow('Erro ao fazer upload da imagem.');

      expect(mockUpdateAvatar).not.toHaveBeenCalled();
    });

    it('should propagate UserAPI update avatar errors', async () => {
      mockGetCroppedImg.mockResolvedValue(croppedFile);
      mockUploadImageToCloudinary.mockResolvedValue({
        url: 'https://cdn.example.com/avatar.png',
        publicId: 'avatar-public-id'
      });
      mockUpdateAvatar.mockRejectedValue(
        new Error('Você não tem permissão para realizar esta alteração.')
      );

      await expect(
        UserService.updateAvatar({
          userId,
          imageSrc,
          pixelCrop
        })
      ).rejects.toThrow('Você não tem permissão para realizar esta alteração.');

      expect(mockUpdateAvatar).toHaveBeenCalledWith(
        userId,
        'https://cdn.example.com/avatar.png'
      );
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      mockUpdatePassword.mockResolvedValue();

      await UserService.updatePassword('new-password');

      expect(mockUpdatePassword).toHaveBeenCalledWith('new-password');
    });

    it('should throw when password is empty', async () => {
      await expect(UserService.updatePassword('   ')).rejects.toThrow(
        'Senha obrigatória.'
      );

      expect(mockUpdatePassword).not.toHaveBeenCalled();
    });

    it('should propagate UserAPI update password errors', async () => {
      mockUpdatePassword.mockRejectedValue(new Error('Weak password'));

      await expect(UserService.updatePassword('123')).rejects.toThrow(
        'Weak password'
      );

      expect(mockUpdatePassword).toHaveBeenCalledWith('123');
    });
  });

  describe('getDefaultOrganization', () => {
    it('should return first available organization', () => {
      const result = UserService.getDefaultOrganization(user);

      expect(result).toEqual(user.availableOrganizations[0]);
    });

    it('should return null when user is null', () => {
      const result = UserService.getDefaultOrganization(null);

      expect(result).toBeNull();
    });

    it('should return null when user has no available organizations', () => {
      const result = UserService.getDefaultOrganization({
        ...user,
        availableOrganizations: []
      });

      expect(result).toBeNull();
    });
  });

  describe('getOrganizationById', () => {
    it('should return organization by id', () => {
      const result = UserService.getOrganizationById(user, 'organization-456');

      expect(result).toEqual(user.availableOrganizations[1]);
    });

    it('should return default organization when organization id is null', () => {
      const result = UserService.getOrganizationById(user, null);

      expect(result).toEqual(user.availableOrganizations[0]);
    });

    it('should return default organization when organization id is empty', () => {
      const result = UserService.getOrganizationById(user, '   ');

      expect(result).toEqual(user.availableOrganizations[0]);
    });

    it('should return default organization when organization id does not exist', () => {
      const result = UserService.getOrganizationById(user, 'organization-999');

      expect(result).toEqual(user.availableOrganizations[0]);
    });

    it('should return null when user has no available organizations', () => {
      const result = UserService.getOrganizationById(
        {
          ...user,
          availableOrganizations: []
        },
        'organization-123'
      );

      expect(result).toBeNull();
    });
  });

  describe('selectOrganization', () => {
    it('should return selected organization when user belongs to it', () => {
      const result = UserService.selectOrganization(user, 'organization-456');

      expect(result).toEqual(user.availableOrganizations[1]);
    });

    it('should throw when user is not loaded', () => {
      expect(() =>
        UserService.selectOrganization(null, 'organization-123')
      ).toThrow('Usuário não carregado.');
    });

    it('should throw when organization id is empty', () => {
      expect(() => UserService.selectOrganization(user, '   ')).toThrow(
        'Organização não informada.'
      );
    });

    it('should throw when user does not belong to selected organization', () => {
      expect(() =>
        UserService.selectOrganization(user, 'organization-999')
      ).toThrow('Usuário não pertence à organização selecionada.');
    });
  });

  describe('isOrganizationMember', () => {
    it('should return true when user belongs to organization', () => {
      const result = UserService.isOrganizationMember(user, 'organization-123');

      expect(result).toBe(true);
    });

    it('should return false when user does not belong to organization', () => {
      const result = UserService.isOrganizationMember(user, 'organization-999');

      expect(result).toBe(false);
    });

    it('should return false when user is null', () => {
      const result = UserService.isOrganizationMember(null, 'organization-123');

      expect(result).toBe(false);
    });

    it('should return false when organization id is null', () => {
      const result = UserService.isOrganizationMember(user, null);

      expect(result).toBe(false);
    });

    it('should return false when organization id is empty', () => {
      const result = UserService.isOrganizationMember(user, '   ');

      expect(result).toBe(false);
    });
  });
});
