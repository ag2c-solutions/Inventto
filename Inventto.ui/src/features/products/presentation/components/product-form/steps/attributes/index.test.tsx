import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserContext } from '@/features/users';

import { ProductFormProvider, type ProductFormProviderProps } from '../../hook';
import { mockFormData } from '../../mocks';

import { ProductAttributes } from './index';

type RenderWithProviderProps = {
  providerProps?: Partial<ProductFormProviderProps>;
};

const createTestWrapper = (props: RenderWithProviderProps = {}) => {
  const { providerProps } = props;
  const queryClient = new QueryClient();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <UserContext.Provider
      value={{ currentOrganization: { id: 'org-1' }, role: 'owner' } as never}
    >
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProductFormProvider mode="Create" {...providerProps}>
            {children}
          </ProductFormProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </UserContext.Provider>
  );
  return Wrapper;
};

export const renderWithProductProvider = (
  ui: ReactElement,
  options: RenderWithProviderProps & Omit<RenderOptions, 'wrapper'> = {}
) => {
  const { providerProps, ...renderOptions } = options;
  const wrapper = createTestWrapper({ providerProps });
  return render(ui, { wrapper, ...renderOptions });
};

vi.mock('./field-attribute-values', () => ({
  ProductsFormFieldAttributeValues: () => <div>Mock de Attribute Values</div>
}));

describe('ProductAttributes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render the initial empty state (without attributes).', () => {
    renderWithProductProvider(<ProductAttributes />);

    expect(
      screen.getByRole('button', { name: 'Adicionar atributo' })
    ).toBeInTheDocument();

    expect(screen.queryByLabelText('Nome do atributo')).not.toBeInTheDocument();
  });

  it('must add and remove an attribute in "Create" mode.', async () => {
    const user = userEvent.setup();

    renderWithProductProvider(<ProductAttributes />);

    const addButton = screen.getByRole('button', {
      name: 'Adicionar atributo'
    });

    await user.click(addButton);

    const nomeInput = await screen.findByLabelText('Nome do atributo');
    const removeButton = screen.getByLabelText('Remover atributo');

    expect(nomeInput).toBeInTheDocument();
    expect(removeButton).toBeInTheDocument();
    expect(nomeInput).toBeEnabled();

    await user.click(addButton);

    expect(screen.getAllByLabelText('Nome do atributo')).toHaveLength(2);

    const allRemoveButtons = screen.getAllByLabelText('Remover atributo');

    await user.click(allRemoveButtons[0]);

    expect(screen.getAllByLabelText('Nome do atributo')).toHaveLength(1);
  });

  it('The attributes should be displayed in "Edit" mode, and the fields should be disabled.', async () => {
    const mockAttributes = [
      { id: '1', slug: 'cor', type: 'select', name: 'Cor', values: ['Azul'] },
      {
        id: '2',
        slug: 'tamanho',
        type: 'select',
        name: 'Tamanho',
        values: ['P']
      }
    ] as never;

    const providerProps: Partial<ProductFormProviderProps> = {
      mode: 'Edit',
      product: {
        ...mockFormData,
        hasVariants: true,
        attributes: mockAttributes,
        variants: []
      } as never
    };

    renderWithProductProvider(<ProductAttributes />, { providerProps });

    const nomeInputs = await screen.findAllByLabelText('Nome do atributo');

    expect(nomeInputs).toHaveLength(2);
    expect(screen.getByDisplayValue('Cor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tamanho')).toBeInTheDocument();
    expect(screen.queryByLabelText('Remover atributo')).not.toBeInTheDocument();
    expect(nomeInputs[0]).toBeDisabled();
    expect(nomeInputs[1]).toBeDisabled();
  });
});
