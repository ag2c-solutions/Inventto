import { type LoaderFunctionArgs, redirect } from 'react-router';

import { UserAPI } from '@/features/users';

import { supabase } from '@/infra/supabase';

async function isAuthenticated(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

async function checkMustChangePassword(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();

  if (!data.session?.user?.id) return false;

  const profile = await UserAPI.getProfile(data.session.user.id);

  return profile?.mustChangePassword || false;
}

export async function protectedLoader({ request }: LoaderFunctionArgs) {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!session) {
    const search = url.search;
    const redirectTo = pathname + search;

    return redirect(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const mustChangePassword = await checkMustChangePassword();

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
  const isAuth = await isAuthenticated();

  if (isAuth) {
    return redirect('/');
  }

  return null;
}
