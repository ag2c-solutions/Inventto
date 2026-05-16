import { render, screen } from '@testing-library/react';
import type { LucideIcon } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { SubmittingButton } from '.';

describe('SubmittingButton', () => {
  it('deve renderizar o label quando state é false', () => {
    render(<SubmittingButton state={false} label="Salvar" />);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });

  it('deve renderizar o spinner quando state é true', () => {
    render(<SubmittingButton state={true} label="Salvar" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('deve estar desabilitado quando state é true', () => {
    render(<SubmittingButton state={true} label="Salvar" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('deve ocultar o label quando showLabel é false', () => {
    render(<SubmittingButton state={true} label="Salvar" showLabel={false} />);
    expect(screen.queryByText('Salvar')).not.toBeInTheDocument();
  });

  it('deve renderizar o ícone quando fornecido e state é false', () => {
    const TestIcon = (() => (
      <svg data-testid="test-icon" />
    )) as unknown as LucideIcon;
    render(<SubmittingButton state={false} label="Salvar" Icon={TestIcon} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});
