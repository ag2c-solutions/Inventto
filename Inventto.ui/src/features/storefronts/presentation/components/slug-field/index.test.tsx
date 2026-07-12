import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SlugField } from './index';

describe('SlugField', () => {
  const user = userEvent.setup();

  it('should render the fixed prefix and the current value', () => {
    render(<SlugField value="atelie-joana" onChange={vi.fn()} state="ok" />);

    expect(screen.getByText('inventto.app/')).toBeInTheDocument();
    expect(screen.getByDisplayValue('atelie-joana')).toBeInTheDocument();
  });

  it('should show a spinner and no message while checking', () => {
    render(
      <SlugField value="atelie-joana" onChange={vi.fn()} state="checking" />
    );

    expect(
      screen.getByText('Endereço público da sua vitrine.')
    ).toBeInTheDocument();
  });

  it('should show the available helper when ok', () => {
    render(<SlugField value="atelie-joana" onChange={vi.fn()} state="ok" />);

    expect(
      screen.getByText('Endereço público da sua vitrine.')
    ).toBeInTheDocument();
  });

  it('should show the exact "taken" error message', () => {
    render(<SlugField value="loja-centro" onChange={vi.fn()} state="taken" />);

    expect(
      screen.getByText('Este endereço já está em uso. Tente outro.')
    ).toBeInTheDocument();
  });

  it('should show the exact "invalid" error message', () => {
    render(
      <SlugField value="Loja Centro!" onChange={vi.fn()} state="invalid" />
    );

    expect(
      screen.getByText(
        'Use só letras minúsculas, números e hífen, de 3 a 50 caracteres.'
      )
    ).toBeInTheDocument();
  });

  it('should show the "taken" message for reserved (quarantine) slugs too', () => {
    render(
      <SlugField value="loja-centro" onChange={vi.fn()} state="reserved" />
    );

    expect(
      screen.getByText('Este endereço já está em uso. Tente outro.')
    ).toBeInTheDocument();
  });

  it('should lowercase typed input on change', async () => {
    const onChange = vi.fn();
    render(<SlugField value="" onChange={onChange} state="idle" />);

    await user.type(screen.getByRole('textbox'), 'A');

    expect(onChange).toHaveBeenCalledWith('a');
  });
});
