import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ATTRIBUTE_VALUES_INPUT_BY_TYPE } from './attributes-values-by-input';

describe('ATTRIBUTE_VALUES_INPUT_BY_TYPE', () => {
  it('should render the color strategy for type "color"', () => {
    render(
      ATTRIBUTE_VALUES_INPUT_BY_TYPE.color({ values: [], onChange: vi.fn() })
    );

    expect(
      screen.getByRole('button', { name: 'Adicionar cor' })
    ).toBeInTheDocument();
  });

  it('should render the select strategy for type "select"', () => {
    render(
      ATTRIBUTE_VALUES_INPUT_BY_TYPE.select({ values: [], onChange: vi.fn() })
    );

    expect(screen.getByPlaceholderText('Ex: P, M, G')).toBeInTheDocument();
  });

  it('should render the text strategy with a number input for type "number"', () => {
    render(
      ATTRIBUTE_VALUES_INPUT_BY_TYPE.number({ values: [], onChange: vi.fn() })
    );

    expect(
      screen.getByPlaceholderText('Digite um número e Enter')
    ).toBeInTheDocument();
  });

  it('should render the text strategy for type "text"', () => {
    render(
      ATTRIBUTE_VALUES_INPUT_BY_TYPE.text({ values: [], onChange: vi.fn() })
    );

    expect(
      screen.getByPlaceholderText('Digite valor e Enter (ou vírgula)')
    ).toBeInTheDocument();
  });
});
