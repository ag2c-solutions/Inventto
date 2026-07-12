import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form } from '@/shared/components/ui/form';

import type { StorefrontGeneralFormValues } from '../../../domain/validators';

const { mockUseCatalogsQuery, mockCheckSlug } = vi.hoisted(() => ({
  mockUseCatalogsQuery: vi.fn(),
  mockCheckSlug: vi.fn()
}));

vi.mock('@/features/catalogs', () => ({
  useCatalogsQuery: mockUseCatalogsQuery
}));

vi.mock('../../../data/api', () => ({
  StorefrontApi: { checkSlug: mockCheckSlug }
}));

import { TabGeneral } from '.';

function Wrapper({
  defaultValues,
  storefrontId
}: {
  defaultValues: StorefrontGeneralFormValues;
  storefrontId?: string;
}) {
  const form = useForm<StorefrontGeneralFormValues>({ defaultValues });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Form {...form}>
        <TabGeneral form={form} storefrontId={storefrontId} isSaving={false} />
      </Form>
    </QueryClientProvider>
  );
}

const BASE_VALUES: StorefrontGeneralFormValues = {
  name: 'Vitrine Ateliê Joana',
  catalogId: 'cat-1',
  slug: 'atelie-joana',
  whatsapp: '11999998888',
  instagram: '@atelie.joana',
  facebook: '',
  website: ''
};

describe('TabGeneral', () => {
  const user = userEvent.setup();

  // Radix Select usa Pointer Capture, ausente no jsdom.
  beforeAll(() => {
    Element.prototype.hasPointerCapture = vi.fn();
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCatalogsQuery.mockReturnValue({
      data: [
        { id: 'cat-1', name: 'Coleção Verão 2026' },
        { id: 'cat-2', name: 'Inverno 2026' }
      ]
    });
    mockCheckSlug.mockResolvedValue({ available: true, reason: 'ok' });
  });

  it('should render identification, address and contact fields', () => {
    render(<Wrapper defaultValues={BASE_VALUES} />);

    expect(
      screen.getByPlaceholderText('ex.: Vitrine Ateliê Joana')
    ).toBeInTheDocument();
    expect(screen.getByText('inventto.app/')).toBeInTheDocument();
    expect(screen.getByDisplayValue('atelie-joana')).toBeInTheDocument();
    expect(screen.getByDisplayValue('11999998888')).toBeInTheDocument();
  });

  it('should list catalogs in the Select', async () => {
    render(<Wrapper defaultValues={BASE_VALUES} />);

    await user.click(screen.getByRole('combobox'));

    expect(
      await screen.findByRole('option', { name: 'Inverno 2026' })
    ).toBeInTheDocument();
  });

  it('should show the placeholder when no catalog is selected (create mode)', () => {
    render(
      <Wrapper defaultValues={{ ...BASE_VALUES, catalogId: undefined }} />
    );

    expect(screen.getByText('Selecione um catálogo…')).toBeInTheDocument();
  });

  it('should let the user type into the slug field', async () => {
    render(<Wrapper defaultValues={{ ...BASE_VALUES, slug: '' }} />);

    const slugInput = screen.getByPlaceholderText('sua-loja');
    await user.type(slugInput, 'nova-loja');

    expect(slugInput).toHaveValue('nova-loja');
  });
});
