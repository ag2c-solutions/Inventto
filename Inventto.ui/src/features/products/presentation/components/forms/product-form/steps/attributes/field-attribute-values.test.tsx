import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProductProvider } from '../../mocks';

import { ProductsFormFieldAttributeValues } from './field-attribute-values';

describe('ProductsFormFieldAttributeValues', () => {
  it('should render badges as the user adds values', () => {
    renderWithProductProvider(
      <ProductsFormFieldAttributeValues
        nameValues="attributes.0.values"
        type="select"
      />
    );

    const input = screen.getByPlaceholderText('Ex: P, M, G');

    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Pequeno' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    fireEvent.change(input, { target: { value: 'Medio' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    fireEvent.change(input, { target: { value: 'Grande' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('Pequeno')).toBeInTheDocument();
    expect(screen.getByText('Medio')).toBeInTheDocument();
    expect(screen.getByText('Grande')).toBeInTheDocument();
  });

  it('should remove extra spaces', () => {
    renderWithProductProvider(
      <ProductsFormFieldAttributeValues
        nameValues="attributes.0.values"
        type="select"
      />
    );
    const input = screen.getByPlaceholderText('Ex: P, M, G');

    fireEvent.change(input, { target: { value: ' Vermelho ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    fireEvent.change(input, { target: { value: '  Azul  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('Vermelho')).toBeInTheDocument();
    expect(screen.getByText('Azul')).toBeInTheDocument();
  });

  it('should remove badges when clicking the remove button', () => {
    renderWithProductProvider(
      <ProductsFormFieldAttributeValues
        nameValues="attributes.0.values"
        type="select"
      />
    );
    const input = screen.getByPlaceholderText('Ex: P, M, G');

    fireEvent.change(input, { target: { value: 'Pequeno' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('Pequeno')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', {
      name: 'Remover opção Pequeno'
    });
    fireEvent.click(removeButton);

    expect(screen.queryByText('Pequeno')).not.toBeInTheDocument();
  });
});
