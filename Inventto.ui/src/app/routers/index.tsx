import { Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';

import { CanNavigate } from '@/features/permissions';

import { AuthLayout } from '../layouts/auth/auth-layout';
import { SystemLayout } from '../layouts/system/system-layout';

import {
  firstAccessLoader,
  protectedLoader,
  publicLoader
} from './guards/auth-loader';

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AuthLayout />
      </Suspense>
    ),
    loader: publicLoader,
    children: [
      {
        path: 'login',
        lazy: async () => {
          const { SignInPage } = await import('@/features/auth/');
          return { Component: SignInPage };
        }
      },
      {
        path: 'register',
        lazy: async () => {
          const { SignUpPage } = await import('@/features/auth/');
          return { Component: SignUpPage };
        }
      },
      {
        path: 'forgot-password',
        lazy: async () => {
          const { RecoverPasswordPage } = await import('@/features/auth/');
          return { Component: RecoverPasswordPage };
        }
      }
    ]
  },
  {
    // Compat: o fluxo de recuperação migrou para OTP em /auth/forgot-password.
    path: '/auth/reset-password',
    element: <Navigate to="/auth/forgot-password" replace />
  },
  {
    path: '/auth/first-access',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AuthLayout />
      </Suspense>
    ),
    loader: firstAccessLoader,
    children: [
      {
        index: true,
        lazy: async () => {
          const { FirstAccessPage } = await import('@/features/auth/');
          return { Component: FirstAccessPage };
        }
      }
    ]
  },
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <SystemLayout />
      </Suspense>
    ),
    loader: protectedLoader,
    children: [
      {
        index: true,
        element: <Navigate to="/products" replace />
      },
      {
        path: 'products',
        element: <CanNavigate required="product:view" />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { ProductsListPage } = await import('@/features/products');
              return { Component: ProductsListPage };
            }
          },
          {
            path: 'create',
            element: <CanNavigate required="product:create" />,
            children: [
              {
                index: true,
                lazy: async () => {
                  const { CreateProductPage } = await import(
                    '@/features/products'
                  );
                  return { Component: CreateProductPage };
                }
              }
            ]
          },
          {
            path: ':productId',
            element: <CanNavigate required="product:view" />,
            children: [
              {
                index: true,
                lazy: async () => {
                  const { ProductDetailsPage } = await import(
                    '@/features/products'
                  );
                  return { Component: ProductDetailsPage };
                }
              }
            ]
          },
          {
            path: ':productId/edit',
            element: <CanNavigate required="product:edit" />,
            children: [
              {
                index: true,
                lazy: async () => {
                  const { EditProductPage } = await import(
                    '@/features/products'
                  );
                  return { Component: EditProductPage };
                }
              }
            ]
          }
        ]
      },
      {
        path: 'movements',
        element: <CanNavigate required="movement:view" />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { MovementsListPage } = await import(
                '@/features/movements'
              );
              return { Component: MovementsListPage };
            }
          },
          {
            path: 'new',
            element: <CanNavigate required="movement:create" />,
            children: [
              {
                index: true,
                lazy: async () => {
                  const { NewStockMovementPage } = await import(
                    '@/features/movements'
                  );
                  return { Component: NewStockMovementPage };
                }
              }
            ]
          }
        ]
      },
      {
        path: 'team',
        element: <CanNavigate required="team:manage" />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { MembersListPage } = await import(
                '@/features/organizations'
              );
              return { Component: MembersListPage };
            }
          }
        ]
      },
      {
        path: 'settings',
        element: <CanNavigate required="org:manage" />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { SettingsPage } = await import('@/features/organizations');
              return { Component: SettingsPage };
            }
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export function AppRouters() {
  return <RouterProvider router={router} />;
}
