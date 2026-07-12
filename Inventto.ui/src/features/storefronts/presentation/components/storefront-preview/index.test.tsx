import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { StorefrontTheme } from '../../../domain/entities';

import { StorefrontPreview } from './index';

const baseTheme: StorefrontTheme = {
  colors: {
    primary: '#3A3631',
    background: '#F7F5F2',
    secondary: '#8B857D',
    text: '#2C2A28'
  },
  layout: 'grid',
  cardStyle: 'minimal-large-image'
};

describe('StorefrontPreview', () => {
  it('should show the public url with the current slug', () => {
    render(
      <StorefrontPreview
        name="Ateliê Joana"
        slug="atelie-joana"
        theme={baseTheme}
      />
    );

    expect(screen.getByText('inventto.app/atelie-joana')).toBeInTheDocument();
  });

  it('should show a placeholder url when there is no slug yet', () => {
    render(<StorefrontPreview name="Ateliê Joana" theme={baseTheme} />);

    expect(screen.getByText('inventto.app/sua-loja')).toBeInTheDocument();
  });

  it('should show the storefront name', () => {
    render(
      <StorefrontPreview
        name="Ateliê Joana"
        slug="atelie-joana"
        theme={baseTheme}
      />
    );

    expect(screen.getByText('Ateliê Joana')).toBeInTheDocument();
  });

  it('should render a 2-column grid for the "grid" layout', () => {
    const { container } = render(
      <StorefrontPreview
        name="Ateliê Joana"
        theme={{ ...baseTheme, layout: 'grid' }}
      />
    );

    expect(container.querySelector('.grid-cols-2')).not.toBeNull();
    expect(container.querySelector('.grid-cols-1')).toBeNull();
  });

  it('should render a 1-column list for the "list" layout', () => {
    const { container } = render(
      <StorefrontPreview
        name="Ateliê Joana"
        theme={{ ...baseTheme, layout: 'list' }}
      />
    );

    expect(container.querySelector('.grid-cols-1')).not.toBeNull();
  });

  it('should show a price bar per card when showPrices is true', () => {
    const { container } = render(
      <StorefrontPreview name="Ateliê Joana" theme={baseTheme} showPrices />
    );

    expect(screen.queryByText('Consultar →')).not.toBeInTheDocument();
    expect(
      container.querySelectorAll('[style*="background"]').length
    ).toBeGreaterThan(0);
  });

  it('should show "Consultar →" per card when showPrices is false', () => {
    render(
      <StorefrontPreview
        name="Ateliê Joana"
        theme={baseTheme}
        showPrices={false}
      />
    );

    expect(screen.getAllByText('Consultar →').length).toBe(4);
  });

  it('should render the logo image when logoUrl is set', () => {
    render(
      <StorefrontPreview
        name="Ateliê Joana"
        theme={{ ...baseTheme, logoUrl: 'https://cdn.test/logo.png' }}
      />
    );

    expect(screen.getByAltText('Logo da vitrine')).toHaveAttribute(
      'src',
      'https://cdn.test/logo.png'
    );
  });
});
