import { render, screen } from '@testing-library/react';
import { Package } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { ImportEmptyState } from '.';

describe('ImportEmptyState', () => {
  it('should render the icon, title and description', () => {
    render(
      <ImportEmptyState
        icon={Package}
        title="Nenhum produto disponível"
        description="Selecione outra organização."
      />
    );

    expect(screen.getByText('Nenhum produto disponível')).toBeInTheDocument();
    expect(
      screen.getByText('Selecione outra organização.')
    ).toBeInTheDocument();
  });
});
