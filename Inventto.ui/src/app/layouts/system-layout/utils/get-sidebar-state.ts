import { SIDEBAR_COOKIE_NAME } from '../constants/sidebart-cookie-name';

export function getInitialSidebarState(): boolean {
  if (typeof document === 'undefined') return true;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`));
  if (!match) return true;
  return match.split('=')[1] === 'true';
}
