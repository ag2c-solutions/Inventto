import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/features/auth';
import { UserProvider } from '@/features/users';

import { queryClient } from '../libs/react-query';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <AuthProvider>
          <UserProvider>{children}</UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
