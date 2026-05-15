import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/features/auth';
import { UserProvider } from '@/features/users';

import { queryClient } from '../libs/react-query';
import { ThemeProvider } from '../theme/theme-provider';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>{children}</UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
