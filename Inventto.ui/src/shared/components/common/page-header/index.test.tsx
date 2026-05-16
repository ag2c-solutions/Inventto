import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PageHeader } from '.';

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarTrigger: ({ className }: { className?: string }) => (
    <button data-testid="sidebar-trigger" className={className} />
  )
}));

describe('PageHeader', () => {
  it('deve renderizar o título', () => {
    render(<PageHeader title="Produtos" />);
    expect(screen.getByText('Produtos')).toBeInTheDocument();
  });

  it('deve renderizar o SidebarTrigger por padrão', () => {
    render(<PageHeader title="Produtos" />);
    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument();
  });

  it('deve ocultar o SidebarTrigger quando showSidebarTrigger é false', () => {
    render(<PageHeader title="Produtos" showSidebarTrigger={false} />);
    expect(screen.queryByTestId('sidebar-trigger')).not.toBeInTheDocument();
  });
});
