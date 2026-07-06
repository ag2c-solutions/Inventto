import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// As dialogs têm comportamento próprio (testado em seus arquivos). Aqui só
// validamos a composição da aba, então usamos stubs leves dos gatilhos.
vi.mock('../../../../actions/deactivate-organization', () => ({
  DeactivateOrganizationDialog: () => <button>Desativar</button>
}));

vi.mock('../../../../actions/delete-organization', () => ({
  DeleteOrganizationDialog: () => <button>Excluir</button>
}));

import { DangerZoneTabContent } from './index';

describe('DangerZoneTabContent', () => {
  it('renderiza a região com o rótulo de acessibilidade e os dois blocos', () => {
    render(<DangerZoneTabContent />);

    expect(
      screen.getByRole('region', { name: 'Zona de risco' })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Ações sensíveis que afetam a operação inteira desta organização.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Desativar organização')).toBeInTheDocument();
    expect(
      screen.getByText(/Pausa as vendas e tira as vitrines do ar/)
    ).toBeInTheDocument();
    expect(screen.getByText('Excluir organização')).toBeInTheDocument();
    expect(
      screen.getByText(/Encerra permanentemente esta unidade/)
    ).toBeInTheDocument();
  });

  it('compõe os gatilhos de desativar e excluir', () => {
    render(<DangerZoneTabContent />);

    expect(
      screen.getByRole('button', { name: 'Desativar' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });
});
