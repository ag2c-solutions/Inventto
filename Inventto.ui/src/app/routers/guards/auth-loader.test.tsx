import type { LoaderFunctionArgs } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  firstAccessLoader,
  protectedLoader,
  publicLoader
} from './auth-loader';

const mockGetSession = vi.fn();
const mockGetProfile = vi.fn();

vi.mock('@/features/auth', () => ({
  AuthService: {
    getSession: (...args: unknown[]) => mockGetSession(...args)
  }
}));

vi.mock('@/features/users', () => ({
  UserService: {
    getProfile: (...args: unknown[]) => mockGetProfile(...args)
  }
}));

function createRequest(url: string): Request {
  return new Request(url);
}

describe('Auth Guards (Loaders)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('protectedLoader (Require Auth)', () => {
    it('should allow access (return null) when user is authenticated', async () => {
      mockGetSession.mockResolvedValue({ user: { id: '1' } });
      mockGetProfile.mockResolvedValue({ mustChangePassword: false });

      const request = createRequest('http://localhost:3000/app/dashboard');
      const response = await protectedLoader({
        request,
        params: {},
        context: {}
      } as LoaderFunctionArgs);

      expect(response).toBeNull();
      expect(mockGetSession).toHaveBeenCalledTimes(1);
    });

    it('should redirect to login with "redirectTo" param when user is NOT authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const targetUrl = 'http://localhost:3000/products/123?filter=active';
      const request = createRequest(targetUrl);
      const response = await protectedLoader({
        request,
        params: {},
        context: {}
      } as LoaderFunctionArgs);

      expect(response).toBeInstanceOf(Response);

      const redirectUrl = (response as Response).headers.get('Location');
      const expectedRedirectPath = '/products/123?filter=active';

      expect(redirectUrl).toBe(
        `/auth/login?redirectTo=${encodeURIComponent(expectedRedirectPath)}`
      );
    });

    it('should redirect to /auth/first-access when mustChangePassword is true', async () => {
      mockGetSession.mockResolvedValue({ user: { id: '1' } });
      mockGetProfile.mockResolvedValue({ mustChangePassword: true });

      const request = createRequest('http://localhost:3000/products');
      const response = await protectedLoader({
        request,
        params: {},
        context: {}
      } as LoaderFunctionArgs);

      expect(response).toBeInstanceOf(Response);

      const redirectUrl = (response as Response).headers.get('Location');
      expect(redirectUrl).toBe('/auth/first-access');
    });

    it('should redirect to / when mustChangePassword is false and path is /auth/first-access', async () => {
      mockGetSession.mockResolvedValue({ user: { id: '1' } });
      mockGetProfile.mockResolvedValue({ mustChangePassword: false });

      const request = createRequest('http://localhost:3000/auth/first-access');
      const response = await protectedLoader({
        request,
        params: {},
        context: {}
      } as LoaderFunctionArgs);

      expect(response).toBeInstanceOf(Response);

      const redirectUrl = (response as Response).headers.get('Location');
      expect(redirectUrl).toBe('/');
    });
  });

  describe('publicLoader (Require Guest)', () => {
    it('should allow access (return null) when user is NOT authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const response = await publicLoader();

      expect(response).toBeNull();
    });

    it('should redirect to home when user IS authenticated', async () => {
      mockGetSession.mockResolvedValue({ user: { id: '1' } });

      const response = await publicLoader();

      expect(response).toBeInstanceOf(Response);

      const redirectUrl = (response as Response).headers.get('Location');

      expect(redirectUrl).toBe('/');
    });
  });

  describe('firstAccessLoader (Require First Access)', () => {
    it('should redirect to /auth/login when user is NOT authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const response = await firstAccessLoader();

      expect(response).toBeInstanceOf(Response);

      const redirectUrl = (response as Response).headers.get('Location');

      expect(redirectUrl).toBe('/auth/login');
    });

    it('should allow access (return null) when user is authenticated and mustChangePassword is true', async () => {
      mockGetSession.mockResolvedValue({ user: { id: '1' } });
      mockGetProfile.mockResolvedValue({ mustChangePassword: true });

      const response = await firstAccessLoader();

      expect(response).toBeNull();
    });

    it('should redirect to / when user is authenticated but mustChangePassword is false', async () => {
      mockGetSession.mockResolvedValue({ user: { id: '1' } });
      mockGetProfile.mockResolvedValue({ mustChangePassword: false });

      const response = await firstAccessLoader();

      expect(response).toBeInstanceOf(Response);

      const redirectUrl = (response as Response).headers.get('Location');

      expect(redirectUrl).toBe('/');
    });
  });
});
