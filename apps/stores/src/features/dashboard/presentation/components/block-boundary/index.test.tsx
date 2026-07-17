import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BlockBoundary } from '.';

describe('BlockBoundary', () => {
  it('should show the skeleton while loading', () => {
    render(
      <BlockBoundary
        isLoading
        isError={false}
        onRetry={vi.fn()}
        skeleton={<div>Carregando bloco</div>}
      >
        <div>Conteúdo do bloco</div>
      </BlockBoundary>
    );

    expect(screen.getByText('Carregando bloco')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo do bloco')).not.toBeInTheDocument();
  });

  it('should show the block error state when isError is true', () => {
    render(
      <BlockBoundary
        isLoading={false}
        isError
        onRetry={vi.fn()}
        skeleton={<div>Carregando bloco</div>}
      >
        <div>Conteúdo do bloco</div>
      </BlockBoundary>
    );

    expect(screen.getByText('Não foi possível carregar.')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo do bloco')).not.toBeInTheDocument();
  });

  it('should show the children when loaded successfully', () => {
    render(
      <BlockBoundary
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
        skeleton={<div>Carregando bloco</div>}
      >
        <div>Conteúdo do bloco</div>
      </BlockBoundary>
    );

    expect(screen.getByText('Conteúdo do bloco')).toBeInTheDocument();
  });

  it('should isolate an errored block from a sibling block that succeeded', () => {
    render(
      <div>
        <BlockBoundary
          isLoading={false}
          isError
          onRetry={vi.fn()}
          skeleton={null}
        >
          <div>Bloco A</div>
        </BlockBoundary>
        <BlockBoundary
          isLoading={false}
          isError={false}
          onRetry={vi.fn()}
          skeleton={null}
        >
          <div>Bloco B</div>
        </BlockBoundary>
      </div>
    );

    expect(screen.getByText('Não foi possível carregar.')).toBeInTheDocument();
    expect(screen.getByText('Bloco B')).toBeInTheDocument();
  });
});
