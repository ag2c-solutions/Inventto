import type { ReactNode } from 'react';
import { UserProvider } from '../features/users/hooks/use-user';
import { AuthProvider } from '../features/auth/hooks/use-auth';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../config/react-query';
import { ThemeProvider } from 'next-themes';

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
