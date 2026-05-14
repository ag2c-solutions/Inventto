import { type LoaderFunctionArgs, redirect } from 'react-router';

import { UserAPI } from '@/features/users';

import { supabase } from '@/infra/supabase';

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

  const profile = await UserAPI.getProfile(session.user.id);

  const mustChangePassword = profile?.mustChangePassword || false;
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
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    return redirect('/');
  }

  return null;
}
