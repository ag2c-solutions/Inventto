import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BusinessAreaButtonGroup } from './index';

describe('BusinessAreaButtonGroup', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar as 3 opções: Loja de roupas, Petshop e Outro', () => {
    render(<BusinessAreaButtonGroup value={undefined} onChange={vi.fn()} />);

    expect(screen.getByText('Loja de roupas')).toBeInTheDocument();
    expect(screen.getByText('Petshop')).toBeInTheDocument();
    expect(screen.getByText('Outro')).toBeInTheDocument();
  });

  it('deve chamar onChange com "clothing" ao clicar em "Loja de roupas"', async () => {
    const onChange = vi.fn();
    render(<BusinessAreaButtonGroup value={undefined} onChange={onChange} />);

    await user.click(screen.getByTestId('business-area-option-clothing'));

    expect(onChange).toHaveBeenCalledWith('clothing');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onChange com "petshop" ao clicar em "Petshop"', async () => {
    const onChange = vi.fn();
    render(<BusinessAreaButtonGroup value={undefined} onChange={onChange} />);

    await user.click(screen.getByTestId('business-area-option-petshop'));

    expect(onChange).toHaveBeenCalledWith('petshop');
  });

  it('deve chamar onChange com "other" ao clicar em "Outro"', async () => {
    const onChange = vi.fn();
    render(<BusinessAreaButtonGroup value={undefined} onChange={onChange} />);

    await user.click(screen.getByTestId('business-area-option-other'));

    expect(onChange).toHaveBeenCalledWith('other');
  });

  it('opção selecionada deve ter aria-checked=true; as demais, aria-checked=false', () => {
    render(<BusinessAreaButtonGroup value="petshop" onChange={vi.fn()} />);

    expect(screen.getByTestId('business-area-option-petshop')).toHaveAttribute(
      'aria-checked',
      'true'
    );

    expect(screen.getByTestId('business-area-option-clothing')).toHaveAttribute(
      'aria-checked',
      'false'
    );

    expect(screen.getByTestId('business-area-option-other')).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('deve exibir mensagem de erro quando errorMessage é fornecida', () => {
    render(
      <BusinessAreaButtonGroup
        value={undefined}
        onChange={vi.fn()}
        errorMessage="Selecione uma área de atuação."
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Selecione uma área de atuação.'
    );
  });

  it('não deve exibir erro quando errorMessage é nula', () => {
    render(
      <BusinessAreaButtonGroup
        value="clothing"
        onChange={vi.fn()}
        errorMessage={null}
      />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('não deve exibir erro quando errorMessage não é fornecida', () => {
    render(<BusinessAreaButtonGroup value="clothing" onChange={vi.fn()} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
