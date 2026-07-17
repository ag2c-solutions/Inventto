import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { importCandidateFactory } from '../../../tests/factories/import-candidate.factory';

vi.mock('./pieces/import-variants-panel', () => ({
  ImportVariantsPanel: () => <div data-testid="variants-panel" />
}));

import { ImportCandidateRow } from '.';

describe('ImportCandidateRow', () => {
  it('should render the candidate name and sku', () => {
    const candidate = importCandidateFactory.build({
      name: 'Produto Teste',
      sku: 'SKU-1',
      variantCount: 0
    });

    render(
      <ImportCandidateRow
        candidate={candidate}
        checked={false}
        disabled={false}
        onCheckedChange={vi.fn()}
      />
    );

    expect(screen.getByText('Produto Teste')).toBeInTheDocument();
    expect(screen.getByText('SKU-1')).toBeInTheDocument();
  });

  it('should call onCheckedChange when the checkbox is toggled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const candidate = importCandidateFactory.build({ variantCount: 0 });

    render(
      <ImportCandidateRow
        candidate={candidate}
        checked={false}
        disabled={false}
        onCheckedChange={onCheckedChange}
      />
    );

    await user.click(screen.getByRole('checkbox'));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('should show the "already imported" badge and force checked+disabled state', () => {
    const candidate = importCandidateFactory.build({
      alreadyImported: true,
      variantCount: 0
    });

    render(
      <ImportCandidateRow
        candidate={candidate}
        checked={false}
        disabled
        onCheckedChange={vi.fn()}
      />
    );

    expect(screen.getByText('Já importado')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should toggle the variants panel when expand is clicked for a candidate with variants', async () => {
    const user = userEvent.setup();
    const candidate = importCandidateFactory.build({ variantCount: 2 });

    render(
      <ImportCandidateRow
        candidate={candidate}
        checked={false}
        disabled={false}
        sourceOrganizationId="org-2"
        onCheckedChange={vi.fn()}
      />
    );

    expect(screen.queryByTestId('variants-panel')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /ver variantes/i }));

    expect(screen.getByTestId('variants-panel')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /ocultar variantes/i })
    );

    expect(screen.queryByTestId('variants-panel')).not.toBeInTheDocument();
  });

  it('should not render an expand button for a candidate without variants', () => {
    const candidate = importCandidateFactory.build({ variantCount: 0 });

    render(
      <ImportCandidateRow
        candidate={candidate}
        checked={false}
        disabled={false}
        onCheckedChange={vi.fn()}
      />
    );

    expect(
      screen.queryByRole('button', { name: /ver variantes/i })
    ).not.toBeInTheDocument();
  });
});
