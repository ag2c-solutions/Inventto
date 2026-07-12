import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form } from '@/shared/components/ui/form';

import type { StorefrontConfigFormValues } from '../../../domain/validators';

vi.mock('@/features/organizations', () => ({
  LogoChange: ({ onLogoChange }: { onLogoChange: (file: File) => void }) => (
    <button
      type="button"
      onClick={() =>
        onLogoChange(new File(['logo'], 'logo.png', { type: 'image/png' }))
      }
    >
      Trocar logo
    </button>
  )
}));

import { TabAppearance } from '.';

function Wrapper({
  defaultValues
}: {
  defaultValues: StorefrontConfigFormValues;
}) {
  const form = useForm<StorefrontConfigFormValues>({ defaultValues });
  return (
    <Form {...form}>
      <TabAppearance form={form} isSaving={false} />
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
  }
};

describe('TabAppearance', () => {
  const user = userEvent.setup();

  // Radix Select usa Pointer Capture, ausente no jsdom.
  beforeAll(() => {
    Element.prototype.hasPointerCapture = vi.fn();
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
  });

  it('should render the 4 color fields with the current hex values', () => {
    render(<Wrapper defaultValues={BASE_VALUES} />);

    expect(screen.getByText('Primária')).toBeInTheDocument();
    expect(screen.getByText('Fundo')).toBeInTheDocument();
    expect(screen.getByText('Secundária')).toBeInTheDocument();
    expect(screen.getByText('Texto')).toBeInTheDocument();
    expect(screen.getByDisplayValue('#3A3631')).toBeInTheDocument();
  });

  it('should render the layout toggle and card style select', () => {
    render(<Wrapper defaultValues={BASE_VALUES} />);

    expect(screen.getByRole('radio', { name: 'Grade' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByText('Minimalista · imagem grande')).toBeInTheDocument();
  });

  it('should switch to Lista and reflect the new value', async () => {
    render(<Wrapper defaultValues={BASE_VALUES} />);

    await user.click(screen.getByRole('radio', { name: 'Lista' }));

    expect(screen.getByRole('radio', { name: 'Lista' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  it('should build a local preview URL when a logo is picked', async () => {
    // Radix Avatar só renderiza a <img> depois que o carregamento real
    // termina (não simulável no jsdom) — a asserção fica no efeito
    // observável: o object URL é criado a partir do File escolhido.
    render(<Wrapper defaultValues={BASE_VALUES} />);

    await user.click(screen.getByRole('button', { name: 'Trocar logo' }));

    expect(URL.createObjectURL).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'logo.png' })
    );
  });

  it('should render the cover uploader with the empty state hint', () => {
    render(<Wrapper defaultValues={BASE_VALUES} />);

    expect(screen.getByText('capa · 1200×400')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Enviar capa' })
    ).toBeInTheDocument();
  });
});
