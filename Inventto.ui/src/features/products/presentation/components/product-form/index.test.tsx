import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useCategoriesQuery,
  useCategoryAddMutation
} from '@/features/categories';

import {
  useCreateProductMutation,
  useUpdateProductMutation
} from '../../hooks/use-mutations';

import { ProductFormProvider } from './hook';
import { ProductForm } from './index';

vi.mock('../../hooks/use-mutations');
vi.mock('@/features/categories', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useCategoriesQuery: vi.fn(),
    useCategoryAddMutation: vi.fn()
  };
});
vi.mock('@/app/services/image-upload');
vi.mock('@/features/users', () => ({
  useUser: () => ({ currentOrganization: { id: 'org-1' }, role: 'owner' })
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.PointerEvent = MouseEvent as typeof PointerEvent;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const renderComponent = (mode: 'Create' | 'Edit' = 'Create') => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ProductFormProvider mode={mode}>
          <ProductForm />
        </ProductFormProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ProductForm UI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCreateProductMutation).mockReturnValue({
      mutateAsync: vi.fn()
    } as never);

    vi.mocked(useUpdateProductMutation).mockReturnValue({
      mutateAsync: vi.fn()
    } as never);

    vi.mocked(useCategoriesQuery).mockReturnValue({
      data: [{ id: 'cat-1', name: 'Categoria Teste' }],
      isLoading: false,
      isError: false,
      error: null
    } as never);

    vi.mocked(useCategoryAddMutation).mockReturnValue({
      mutateAsync: vi.fn()
    } as never);
  });

  it('should render the form with initial state', () => {
    renderComponent('Create');

    expect(screen.getByText('Informações Básicas')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Avançar/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Cancelar/i })
    ).toBeInTheDocument();
  });

  it('should navigate to "Atributos" step when "Has Variants" is toggled and valid data is filled', async () => {
    const user = userEvent.setup();

    renderComponent('Create');

    const variantSwitch = screen.getByRole('switch', {
      name: /Variações/i
    });

    await user.click(variantSwitch);
    await user.type(
      screen.getByLabelText(/Nome do Produto/i),
      'Produto Com Variantes'
    );

    const categoryTrigger = screen.getByRole('combobox', {
      name: /Categoria/i
    });

    await user.click(categoryTrigger);

    const categoryOption = await screen.findByText('Categoria Teste');

    await user.click(categoryOption);

    const nextButton = screen.getByRole('button', { name: /Avançar/i });

    await user.click(nextButton);

    expect(await screen.findByText('Atributos')).toBeInTheDocument();
  });

  it('should render correctly in Edit mode', () => {
    renderComponent('Edit');

    expect(screen.getByText('Informações Básicas')).toBeInTheDocument();
  });

  it('should show validation errors when attempting to proceed with empty required fields', async () => {
    const user = userEvent.setup();

    renderComponent('Create');

    const nextButton = screen.getByRole('button', { name: /Avançar/i });

    await user.click(nextButton);

    expect(
      await screen.findByText('Nome deve ter no mínimo 3 caracteres.')
    ).toBeInTheDocument();

    expect(
      await screen.findByText('Selecione pelo menos uma categoria.')
    ).toBeInTheDocument();
  });
});
