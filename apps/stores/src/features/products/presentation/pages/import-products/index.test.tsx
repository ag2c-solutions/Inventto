import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ImportCandidate } from '../../../domain/entities';
import {
  importCandidateFactory,
  importCandidateVariantFactory
} from '../../../tests/factories/import-candidate.factory';
import { useImportProductsMutation } from '../../hooks/use-mutations';
import {
  useImportCandidatesQuery,
  useProductsQuery,
  useSourceProductVariantsQuery
} from '../../hooks/use-queries';

import { ImportProductsPage } from './index';

vi.mock('../../hooks/use-queries');
vi.mock('../../hooks/use-mutations');

const mockUseUser = vi.fn();

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

const TWO_ORGS = [
  { id: 'org-1', name: 'Ateliê Joana' },
  { id: 'org-2', name: 'Loja Shopping Norte' }
];

const CANDIDATES: ImportCandidate[] = [
  importCandidateFactory.build({
    id: 'p-1',
    name: 'Tênis Casual Couro',
    sku: 'TC-COURO',
    alreadyImported: false,
    variantCount: 3
  }),
  importCandidateFactory.build({
    id: 'p-2',
    name: 'Boné Aba Curva',
    sku: 'BC-ABA',
    alreadyImported: true,
    variantCount: 0
  })
];

const mutateMock = vi.fn();
const user = userEvent.setup();

function setup(candidates: ImportCandidate[] = CANDIDATES, orgs = TWO_ORGS) {
  mockUseUser.mockReturnValue({
    currentOrganization: orgs[0],
    availableOrganizations: orgs
  });
  vi.mocked(useImportCandidatesQuery).mockReturnValue({
    data: candidates,
    isFetching: false
  } as never);
  vi.mocked(useImportProductsMutation).mockReturnValue({
    mutate: mutateMock,
    isPending: false
  } as never);
  vi.mocked(useProductsQuery).mockReturnValue({} as never);
  vi.mocked(useSourceProductVariantsQuery).mockReturnValue({
    data: [
      importCandidateVariantFactory.build({
        id: 'v-1',
        sku: 'TC-COURO-P',
        options: [{ name: 'Cor', value: 'Preto' }]
      })
    ],
    isLoading: false
  } as never);

  return render(
    <MemoryRouter>
      <ImportProductsPage />
    </MemoryRouter>
  );
}

async function selectSource() {
  await user.click(screen.getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: 'Loja Shopping Norte' }));
}

describe('ImportProductsPage', () => {
  // Radix Select usa Pointer Capture, ausente no jsdom.
  beforeAll(() => {
    Element.prototype.hasPointerCapture = vi.fn();
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exibe estado orientativo quando há apenas uma organização', () => {
    setup(CANDIDATES, [TWO_ORGS[0]]);

    expect(
      screen.getByText(
        'Você precisa de mais de uma organização para importar produtos.'
      )
    ).toBeInTheDocument();
  });

  it('exibe mensagem quando não há produtos disponíveis na origem', async () => {
    setup([]);
    await selectSource();

    expect(
      screen.getByText(
        'Nenhum produto disponível para importar nesta organização.'
      )
    ).toBeInTheDocument();
  });

  it('lista candidatos e marca "Já importado" com checkbox desabilitada', async () => {
    setup();
    await selectSource();

    expect(screen.getByText('Tênis Casual Couro')).toBeInTheDocument();
    expect(screen.getByText('Já importado')).toBeInTheDocument();
    expect(screen.getByText('3 variações')).toBeInTheDocument();

    expect(screen.getByLabelText('Selecionar Boné Aba Curva')).toBeDisabled();
  });

  it('atualiza o contador ao selecionar e dispara a importação', async () => {
    setup();
    await selectSource();

    await user.click(screen.getByLabelText('Selecionar Tênis Casual Couro'));

    expect(screen.getByText('1')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Importar selecionados/i })
    );

    expect(mutateMock).toHaveBeenCalledWith(
      { sourceOrganizationId: 'org-2', productIds: ['p-1'] },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it('mostra o helper de estoque zero', async () => {
    setup();
    await selectSource();

    expect(screen.getByText(/nascem com estoque zero/i)).toBeInTheDocument();
  });

  it('expande a linha e exibe as variantes do produto', async () => {
    setup();
    await selectSource();

    expect(screen.queryByText('TC-COURO-P')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /Ver variantes de Tênis Casual Couro/i
      })
    );

    expect(screen.getByText('TC-COURO-P')).toBeInTheDocument();
  });
});
