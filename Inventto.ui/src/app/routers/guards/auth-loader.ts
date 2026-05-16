import { type LoaderFunctionArgs, redirect } from 'react-router';

import { AuthService } from '@/features/auth';
import { UserService } from '@/features/users';

export async function protectedLoader({ request }: LoaderFunctionArgs) {
  const session = await AuthService.getSession();
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!session) {
    const search = url.search;
    const redirectTo = pathname + search;

    return redirect(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const profile = await UserService.getProfile(session.user.id);

  const mustChangePassword = profile.mustChangePassword;
  const isAtFirstAccessPage = pathname === '/auth/first-access';

  if (mustChangePassword && !isAtFirstAccessPage) {
    return redirect('/auth/first-access');
  }

  if (!mustChangePassword && isAtFirstAccessPage) {
    return redirect('/');
  }

  return null;
}

export async function publicLoader() {
  const session = await AuthService.getSession();

  if (session) return redirect('/');

  return null;
}

export async function firstAccessLoader(): Promise<Response | null> {
  const session = await AuthService.getSession();

  if (!session) return redirect('/auth/login');

  const profile = await UserService.getProfile(session.user.id);

  if (!profile.mustChangePassword) return redirect('/');

  return null;
}
