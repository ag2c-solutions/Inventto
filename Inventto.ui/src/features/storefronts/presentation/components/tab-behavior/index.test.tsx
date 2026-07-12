import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Form } from '@/shared/components/ui/form';

import type { StorefrontConfigFormValues } from '../../../domain/validators';

const { mockUseFeaturableProductsQuery, mockUseToggleFeatureMutation } =
  vi.hoisted(() => ({
    mockUseFeaturableProductsQuery: vi.fn(),
    mockUseToggleFeatureMutation: vi.fn()
  }));

vi.mock('../../hooks/use-queries', () => ({
  useFeaturableProductsQuery: mockUseFeaturableProductsQuery
}));

vi.mock('../../hooks/use-mutations', () => ({
  useToggleFeatureMutation: mockUseToggleFeatureMutation
}));

import { TabBehavior } from '.';

function Wrapper({
  defaultValues,
  storefrontId
}: {
  defaultValues: StorefrontConfigFormValues;
  storefrontId?: string;
}) {
  const form = useForm<StorefrontConfigFormValues>({ defaultValues });
  return (
    <Form {...form}>
      <TabBehavior form={form} storefrontId={storefrontId} isSaving={false} />
    </Form>
  );
}

const BASE_VALUES: StorefrontConfigFormValues = {
  name: 'Vitrine Ateliê Joana',
  catalogId: 'cat-1',
  slug: 'atelie-joana',
  whatsapp: '11999998888',
  instagram: '',
  facebook: '',
  website: '',
  theme: {
    colors: {
      primary: '#3A3631',
      background: '#F7F5F2',
      secondary: '#8B857D',
      text: '#2C2A28'
    },
    layout: 'grid',
    cardStyle: 'minimal-large-image'
  },
  behavior: {
    showPrices: true,
    showSoldOut: true,
    whatsappMessage: ''
  }
};

describe('TabBehavior', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFeaturableProductsQuery.mockReturnValue({
      data: [
        {
          productId: 'p1',
          name: 'Vestido Linho Areia',
          sku: 'VL-AREIA-01',
          isFeatured: false
        }
      ],
      isLoading: false
    });
    mockUseToggleFeatureMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false
    });
  });

  it('should render the price and sold-out switches on', () => {
    render(<Wrapper defaultValues={BASE_VALUES} storefrontId="s1" />);

    expect(screen.getByText('Mostrar preços')).toBeInTheDocument();
    expect(screen.getByText('Mostrar produtos esgotados')).toBeInTheDocument();
    const switches = screen.getAllByRole('switch');
    expect(switches[0]).toHaveAttribute('data-state', 'checked');
    expect(switches[1]).toHaveAttribute('data-state', 'checked');
  });

  it('should toggle "Mostrar preços" off and mark the form dirty', async () => {
    render(<Wrapper defaultValues={BASE_VALUES} storefrontId="s1" />);

    await user.click(screen.getAllByRole('switch')[0]);

    expect(screen.getAllByRole('switch')[0]).toHaveAttribute(
      'data-state',
      'unchecked'
    );
  });

  it('should render the WhatsApp message textarea', () => {
    render(<Wrapper defaultValues={BASE_VALUES} storefrontId="s1" />);

    expect(
      screen.getByPlaceholderText(
        'Olá! Vi sua vitrine e gostaria de fazer um pedido.'
      )
    ).toBeInTheDocument();
  });

  it('should render the featured products list', () => {
    render(<Wrapper defaultValues={BASE_VALUES} storefrontId="s1" />);

    expect(screen.getByText('Vestido Linho Areia')).toBeInTheDocument();
  });

  it('should show a hint instead of the list when there is no storefrontId yet', () => {
    render(<Wrapper defaultValues={BASE_VALUES} storefrontId={undefined} />);

    expect(
      screen.getByText('Salve a vitrine para poder destacar produtos.')
    ).toBeInTheDocument();
  });
});
