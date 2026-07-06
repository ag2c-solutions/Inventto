import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LinkedChannels } from './index';

describe('LinkedChannels', () => {
  it('should show the empty message when there are no linked channels', () => {
    render(<LinkedChannels channels={[]} />);

    expect(
      screen.getByText('Nenhum canal vinculado a este catálogo.')
    ).toBeInTheDocument();
  });

  it('should list each linked channel with its name and meta', () => {
    render(
      <LinkedChannels
        channels={[
          { id: '1', name: 'Loja Online', meta: 'Vitrine' },
          { id: '2', name: 'Caixa 1', meta: 'PDV' }
        ]}
      />
    );

    expect(screen.getByText('Loja Online')).toBeInTheDocument();
    expect(screen.getByText('Vitrine')).toBeInTheDocument();
    expect(screen.getByText('Caixa 1')).toBeInTheDocument();
    expect(screen.getByText('PDV')).toBeInTheDocument();
    expect(
      screen.queryByText('Nenhum canal vinculado a este catálogo.')
    ).not.toBeInTheDocument();
  });
});
