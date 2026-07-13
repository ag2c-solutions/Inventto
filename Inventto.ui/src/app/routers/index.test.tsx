import { describe, expect, it } from 'vitest';

import { DashboardPage } from '@/features/dashboard';

import { routeConfig } from '.';

describe('routeConfig', () => {
  it('should render DashboardPage at the index route "/" instead of redirecting to /products', async () => {
    const systemRoute = routeConfig.find((route) => route.path === '/');
    const indexRoute = systemRoute?.children?.find((route) => route.index);

    expect(indexRoute?.element).toBeUndefined();

    const resolved = await indexRoute?.lazy?.();

    expect(resolved?.Component).toBe(DashboardPage);
  });
});
