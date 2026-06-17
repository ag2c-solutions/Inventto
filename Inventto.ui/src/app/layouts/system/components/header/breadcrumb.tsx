import { Link, useLocation } from 'react-router';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/shared/components/ui/breadcrumb';

import { ROUTE_LABELS } from '../../constants/route-labels';

/**
 * Derives breadcrumb segments from the current pathname.
 * Only presentation logic — no business rules.
 */
function buildSegments(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);

  const segments: { label: string; href: string }[] = [
    { label: ROUTE_LABELS['/'] ?? 'Início', href: '/' }
  ];

  let accumulated = '';

  for (const part of parts) {
    accumulated += `/${part}`;
    const label = ROUTE_LABELS[accumulated];

    if (label) {
      segments.push({ label, href: accumulated });
    }
  }

  return segments;
}

export const AppBreadcrumb = () => {
  const { pathname } = useLocation();
  const segments = buildSegments(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <BreadcrumbItem key={segment.href}>
              {isLast ? (
                <BreadcrumbPage aria-current="page">
                  {segment.label}
                </BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={segment.href}>{segment.label}</Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
