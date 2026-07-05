import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CloudinaryService } from '@/infra/cloudinary';
import { supabase } from '@/infra/supabase';

import type { User } from '../../domain/entities';
import type { UserWithOrganizationDTO } from '../dtos';
import { handleUserError } from '../handlers/error-handler';
import { UserMapper } from '../mappers';

import { UserAPI } from './index';

vi.mock('@/infra/cloudinary', () => ({
  CloudinaryService: {
    uploadImage: vi.fn()
  }
}));

vi.mock('@/infra/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      updateUser: vi.fn(),
      getUser: vi.fn(),
      signInWithPassword: vi.fn()
    }
  }
}));

vi.mock('../handlers/error-handler', () => ({
  handleUserError: vi.fn()
}));

vi.mock('../mappers', () => ({
  UserMapper: {
    toDomain: vi.fn()
  }
}));

const mockSupabaseFrom = vi.mocked(supabase.from);
const mockUpdateUser = vi.mocked(supabase.auth.updateUser);
const mockGetUser = vi.mocked(supabase.auth.getUser);
const mockSignInWithPassword = vi.mocked(supabase.auth.signInWithPassword);
const mockHandleUserError = vi.mocked(handleUserError);
const mockToDomain = vi.mocked(UserMapper.toDomain);
const mockUploadImage = vi.mocked(CloudinaryService.uploadImage);

function createGetProfileQueryMock(result: {
  data: UserWithOrganizationDTO | null;
  error: { code?: string; message?: string } | null;
}) {
  const overrideTypes = vi.fn().mockResolvedValue(result);
  const single = vi.fn(() => ({ overrideTypes }));
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));

  return {
    select,
    eq,
    single,
    overrideTypes
  };
}

function createUpdateAvatarQueryMock(result: {
  error: { code?: string; message?: string; details?: string } | null;
}) {
  const eq = vi.fn().mockResolvedValue(result);
  const update = vi.fn(() => ({ eq }));

  return {
    update,
    eq
  };
}

describe('UserAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    const userId = 'user-123';

    const userDto: UserWithOrganizationDTO = {
      id: userId,
      full_name: 'Rafael Conceição',
      email: 'rafael@test.com',
      avatar_url: 'https://cdn.example.com/avatar.png',
      must_change_password: false,
      created_at: '2026-05-04T10:00:00.000Z',
      updated_at: '2026-05-04T12:00:00.000Z',
      organization_members: [
        {
          role: 'owner',
          organization_id: 'organization-123',
          organizations: {
            id: 'organization-123',
            name: 'Inventto',
            slug: 'inventto'
          }
        },
        {
          role: 'manager',
          organization_id: 'organization-456',
          organizations: {
            id: 'organization-456',
            name: 'Smart Tech',
            slug: 'smart-tech'
          }
        }
      ]
    };

    const user: User = {
      id: userId,
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
          role: 'owner'
        },
        {
          id: 'organization-456',
          name: 'Smart Tech',
          role: 'manager'
        }
      ]
    };

    it('should get user profile successfully', async () => {
      const queryMock = createGetProfileQueryMock({
        data: userDto,
        error: null
      });

      mockSupabaseFrom.mockReturnValue(queryMock as never);
      mockToDomain.mockReturnValue(user);

      const result = await UserAPI.getProfile(userId);

      expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles');

      expect(queryMock.select).toHaveBeenCalledWith(
        expect.stringContaining('organization_members')
      );

      expect(queryMock.select).toHaveBeenCalledWith(
        expect.stringContaining('must_change_password')
      );

      expect(queryMock.eq).toHaveBeenCalledWith('id', userId);
      expect(queryMock.single).toHaveBeenCalled();
      expect(queryMock.overrideTypes).toHaveBeenCalled();

      expect(mockToDomain).toHaveBeenCalledWith(userDto);
      expect(result).toEqual(user);
    });

    it('should return null when profile does not exist', async () => {
      const queryMock = createGetProfileQueryMock({
        data: null,
        error: {
          code: 'PGRST116',
          message: 'JSON object requested, multiple or no rows returned'
        }
      });

      mockSupabaseFrom.mockReturnValue(queryMock as never);

      const result = await UserAPI.getProfile(userId);

      expect(result).toBeNull();
      expect(mockToDomain).not.toHaveBeenCalled();
      expect(mockHandleUserError).not.toHaveBeenCalled();
    });

    it('should return null when data is empty and there is no error', async () => {
      const queryMock = createGetProfileQueryMock({
        data: null,
        error: null
      });

      mockSupabaseFrom.mockReturnValue(queryMock as never);

      const result = await UserAPI.getProfile(userId);

      expect(result).toBeNull();
      expect(mockToDomain).not.toHaveBeenCalled();
      expect(mockHandleUserError).not.toHaveBeenCalled();
    });

    it('should handle get profile errors', async () => {
      const error = {
        code: '42501',
        message: 'Permission denied',
        details: ''
      };

      const queryMock = createGetProfileQueryMock({
        data: null,
        error
      });

      mockSupabaseFrom.mockReturnValue(queryMock as never);

      mockHandleUserError.mockImplementation(() => {
        throw new Error('Você não tem permissão para realizar esta alteração.');
      });

      await expect(UserAPI.getProfile(userId)).rejects.toThrow(
        'Você não tem permissão para realizar esta alteração.'
      );

      expect(mockHandleUserError).toHaveBeenCalledWith(error, 'getProfile');
      expect(mockToDomain).not.toHaveBeenCalled();
    });
  });

  describe('updateAvatar', () => {
    const userId = 'user-123';
    const avatarUrl = 'https://cdn.example.com/avatar.png';

    it('should update avatar successfully', async () => {
      const queryMock = createUpdateAvatarQueryMock({
        error: null
      });

      mockSupabaseFrom.mockReturnValue(queryMock as never);

      await UserAPI.updateAvatar(userId, avatarUrl);

      expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles');

      expect(queryMock.update).toHaveBeenCalledWith({
        avatar_url: avatarUrl
      });

      expect(queryMock.eq).toHaveBeenCalledWith('id', userId);
      expect(mockHandleUserError).not.toHaveBeenCalled();
    });

    it('should handle update avatar errors', async () => {
      const error = {
        code: '42501',
        message: 'Permission denied',
        details: ''
      };

      const queryMock = createUpdateAvatarQueryMock({
        error
      });

      mockSupabaseFrom.mockReturnValue(queryMock as never);

      mockHandleUserError.mockImplementation(() => {
        throw new Error('Você não tem permissão para realizar esta alteração.');
      });

      await expect(UserAPI.updateAvatar(userId, avatarUrl)).rejects.toThrow(
        'Você não tem permissão para realizar esta alteração.'
      );

      expect(mockHandleUserError).toHaveBeenCalledWith(error, 'updateAvatar');
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { email: 'rafael@test.com' } },
        error: null
      } as never);

      mockSignInWithPassword.mockResolvedValue({
        data: {},
        error: null
      } as never);

      mockUpdateUser.mockResolvedValue({
        data: { user: null },
        error: null
      } as never);

      await UserAPI.updatePassword({
        currentPassword: 'old-password',
        newPassword: 'new-password'
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'rafael@test.com',
        password: 'old-password'
      });

      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'new-password'
      });

      expect(mockHandleUserError).not.toHaveBeenCalled();
    });

    it('should handle update password errors', async () => {
      const error = {
        message: 'Password should be at least 6 characters',
        status: 400
      };

      mockGetUser.mockResolvedValue({
        data: { user: { email: 'rafael@test.com' } },
        error: null
      } as never);

      mockSignInWithPassword.mockResolvedValue({
        data: {},
        error: null
      } as never);

      mockUpdateUser.mockResolvedValue({
        data: { user: null },
        error
      } as never);

      mockHandleUserError.mockImplementation(() => {
        throw new Error('A senha é muito fraca. Escolha uma senha mais forte.');
      });

      await expect(
        UserAPI.updatePassword({
          currentPassword: 'old-password',
          newPassword: '123'
        })
      ).rejects.toThrow('A senha é muito fraca. Escolha uma senha mais forte.');

      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: '123'
      });

      expect(mockHandleUserError).toHaveBeenCalledWith(error, 'updatePassword');
    });

    it('should delegate to handleUserError when the current password is wrong', async () => {
      const signInError = {
        message: 'Invalid login credentials',
        status: 400
      };

      mockGetUser.mockResolvedValue({
        data: { user: { email: 'rafael@test.com' } },
        error: null
      } as never);

      mockSignInWithPassword.mockResolvedValue({
        data: {},
        error: signInError
      } as never);

      mockHandleUserError.mockImplementation(() => {
        throw new Error('Senha atual incorreta.');
      });

      await expect(
        UserAPI.updatePassword({
          currentPassword: 'wrong-password',
          newPassword: 'new-password'
        })
      ).rejects.toThrow('Senha atual incorreta.');

      expect(mockUpdateUser).not.toHaveBeenCalled();
      expect(mockHandleUserError).toHaveBeenCalledWith(
        signInError,
        'updatePassword'
      );
    });
  });

  describe('saveProfileImage', () => {
    const file = new File(['content'], 'avatar.png', { type: 'image/png' });

    it('should upload image and return url successfully', async () => {
      mockUploadImage.mockResolvedValue({
        url: 'https://cdn.example.com/avatar.png',
        publicId: 'avatar-public-id'
      });

      const result = await UserAPI.saveProfileImage(file);

      expect(CloudinaryService.uploadImage).toHaveBeenCalledWith(file);
      expect(result).toBe('https://cdn.example.com/avatar.png');
    });

    it('should call handleUserError when upload fails', async () => {
      const error = new Error('Upload failed');

      mockUploadImage.mockRejectedValue(error);

      mockHandleUserError.mockImplementation(() => {
        throw new Error('Upload failed');
      });

      await expect(UserAPI.saveProfileImage(file)).rejects.toThrow(
        'Upload failed'
      );

      expect(mockHandleUserError).toHaveBeenCalledWith(
        error,
        'saveProfileImage'
      );
    });
  });
});
