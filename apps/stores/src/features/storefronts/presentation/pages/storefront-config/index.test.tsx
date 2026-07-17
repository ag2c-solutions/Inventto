import { renderHook } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { StorefrontConfigFormValues } from '../../../domain/validators';

const { mockUseStorefrontConfigForm, mockUseIsMobile, mockUseThemeImageField } =
  vi.hoisted(() => ({
    mockUseStorefrontConfigForm: vi.fn(),
    mockUseIsMobile: vi.fn(() => false),
    mockUseThemeImageField: vi.fn(() => ({
      preview: undefined,
      handleChange: vi.fn()
    }))
  }));

vi.mock('./hooks/use-storefront-config-form', () => ({
  useStorefrontConfigForm: mockUseStorefrontConfigForm
}));

vi.mock('@/shared/hooks/use-is-mobile', () => ({
  useIsMobile: mockUseIsMobile
}));

vi.mock('../../components/tab-appearance/hooks/use-theme-image-field', () => ({
  useThemeImageField: mockUseThemeImageField
}));

vi.mock('../../components/actions/back-to-storefronts', () => ({
  BackToStorefrontsLink: () => <div data-testid="back-link" />
}));

vi.mock('../../components/tab-general', () => ({
  TabGeneral: () => <div data-testid="tab-general" />
}));

vi.mock('../../components/tab-appearance', () => ({
  TabAppearance: () => <div data-testid="tab-appearance" />
}));

vi.mock('../../components/tab-behavior', () => ({
  TabBehavior: () => <div data-testid="tab-behavior" />
}));

vi.mock('../../components/storefront-preview', () => ({
  StorefrontPreview: () => <div data-testid="storefront-preview" />
}));

import { StorefrontConfigPage } from '.';

const BASE_VALUES: StorefrontConfigFormValues = {
  name: 'Vitrine Ateliê Joana',
  catalogId: 'cat-1',
  slug: 'atelie-joana',
  whatsapp: '',
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

function buildForm() {
  const { result } = renderHook(() =>
    useForm<StorefrontConfigFormValues>({ defaultValues: BASE_VALUES })
  );
  return result.current;
}

interface ConfigFormMockOverrides {
  isCreate?: boolean;
  storefrontState?: 'live' | 'inactive';
  isLoading?: boolean;
  showActionBar?: boolean;
  activeTab?: string;
}

function mockConfigForm(overrides: ConfigFormMockOverrides = {}) {
  mockUseStorefrontConfigForm.mockReturnValue({
    form: buildForm(),
    storefrontId: 's1',
    isCreate: false,
    storefrontName: 'Vitrine Ateliê Joana',
    storefrontState: 'live',
    publicUrl: 'inventto.app/atelie-joana',
    onSubmit: vi.fn((e) => e?.preventDefault()),
    onDiscard: vi.fn(),
    isLoading: false,
    showActionBar: false,
    activeTab: 'geral',
    setActiveTab: vi.fn(),
    ...overrides
  });
}

describe('StorefrontConfigPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false);
    mockConfigForm();
  });

  it('should not render the fixed bottom action bar when there is no pending change', () => {
    mockConfigForm({ showActionBar: false });
    render(<StorefrontConfigPage />);

    expect(screen.queryAllByRole('button', { name: 'Descartar' })).toHaveLength(
      0
    );
  });

  it('should render a fixed bottom action bar when there is a pending change', () => {
    mockConfigForm({ showActionBar: true });
    const { container } = render(<StorefrontConfigPage />);

    const fixedBar = container.querySelector('.fixed.inset-x-0.bottom-0');
    expect(fixedBar).not.toBeNull();
    expect(fixedBar).toHaveTextContent('Descartar');
    expect(fixedBar).toHaveTextContent('Salvar alterações');
  });

  it('should render the tabs inside a horizontally scrollable container', () => {
    const { container } = render(<StorefrontConfigPage />);

    const scrollContainer = container.querySelector('.overflow-x-auto');
    expect(scrollContainer).not.toBeNull();
    expect(scrollContainer?.textContent).toContain('Geral');
  });

  it('should render the appearance preview after the form in source order (stacks below on mobile)', () => {
    mockConfigForm({ activeTab: 'aparencia' });
    const { container } = render(<StorefrontConfigPage />);

    const appearance = container.querySelector(
      '[data-testid="tab-appearance"]'
    );
    const preview = container.querySelector(
      '[data-testid="storefront-preview"]'
    );
    expect(appearance).not.toBeNull();
    expect(preview).not.toBeNull();

    const position = appearance!.compareDocumentPosition(preview!);

    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
