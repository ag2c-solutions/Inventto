import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductTableColumnActions } from './actions';

vi.mock('@/features/users', () => ({
  useUser: vi.fn().mockReturnValue({
    currentOrganization: { id: 'org-1' },
    role: 'manager'
  })
}));

vi.mock('@/features/permissions', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    VisibleTo: ({ children }: { children: ReactNode }) => <>{children}</>
  };
});

vi.mock('react-router', async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>();

  return {
    ...mod,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Link: ({ to, children, className, ...rest }: any) => (
      <a
        href={to}
        className={className}
        data-testid={`link-${String(children[1]).toLowerCase().trim().replace(' ', '-')}`}
        {...rest}
      >
        {children}
      </a>
    )
  };
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;
window.PointerEvent = MouseEvent as typeof PointerEvent;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

const renderComponent = (productId: string) => {
  return render(
    <MemoryRouter>
      <ProductTableColumnActions productId={productId} />
    </MemoryRouter>
  );
};

describe('ProductTableColumnActions', () => {
  const TEST_PRODUCT_ID = 'prod-xyz-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the menu trigger button', () => {
    renderComponent(TEST_PRODUCT_ID);

    expect(
      screen.getByRole('button', { name: /Abrir menu de ações do produto/i })
    ).toBeInTheDocument();
  });

  it('should open the menu and display all 4 action items', async () => {
    const user = userEvent.setup();

    renderComponent(TEST_PRODUCT_ID);

    const triggerButton = screen.getByRole('button', {
      name: /Abrir menu de ações do produto/i
    });

    await user.click(triggerButton);

    const menuItems = await screen.findAllByRole('menuitem');

    expect(menuItems).toHaveLength(4);
    expect(screen.getByText('Detalhes')).toBeInTheDocument();
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Histórico de movimentação')).toBeInTheDocument();
    expect(screen.getByText('Registrar movimentação')).toBeInTheDocument();
  });

  it('should generate the "Details" and "Edit" links with the correct product ID', async () => {
    const user = userEvent.setup();

    renderComponent(TEST_PRODUCT_ID);

    const triggerButton = screen.getByRole('button', {
      name: /Abrir menu de ações do produto/i
    });

    await user.click(triggerButton);

    const linkDetalhes = await screen.findByTestId('link-detalhes');

    expect(linkDetalhes).toHaveAttribute(
      'href',
      `/products/${TEST_PRODUCT_ID}`
    );

    const linkEditar = await screen.findByTestId('link-editar');

    expect(linkEditar).toHaveAttribute(
      'href',
      `/products/${TEST_PRODUCT_ID}/edit`
    );
  });
});
