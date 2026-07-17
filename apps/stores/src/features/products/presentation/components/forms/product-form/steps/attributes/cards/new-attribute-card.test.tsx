import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useProductForm } from '../../../hook';
import { renderWithProductProvider } from '../../../mocks';

import { NewAttributeCard, type SystemAttribute } from './new-attribute-card';

const systemAttributes: SystemAttribute[] = [
  { id: 'sys-cor', label: 'Cor', slug: 'cor', type: 'color', values: ['Azul'] }
];

function NewAttributeCardHarness({
  onRemove
}: {
  onRemove: (index: number) => void;
}) {
  const { form } = useProductForm();

  return (
    <NewAttributeCard
      form={form}
      index={0}
      onRemove={onRemove}
      systemAttributes={systemAttributes}
    />
  );
}

beforeEach(() => {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('NewAttributeCard', () => {
  it('should fill the field with a system attribute when selected', async () => {
    const user = userEvent.setup();

    renderWithProductProvider(<NewAttributeCardHarness onRemove={vi.fn()} />);

    await user.click(
      screen.getByRole('combobox', { name: /nome do atributo/i })
    );
    await user.click(await screen.findByText('Cor'));

    expect(
      screen.getByRole('combobox', { name: /nome do atributo/i })
    ).toHaveTextContent('Cor');
  });

  it('should create a custom attribute from typed text', async () => {
    const user = userEvent.setup();

    renderWithProductProvider(<NewAttributeCardHarness onRemove={vi.fn()} />);

    await user.click(
      screen.getByRole('combobox', { name: /nome do atributo/i })
    );
    await user.type(
      screen.getByPlaceholderText('Buscar atributo...'),
      'Material'
    );

    await user.click(await screen.findByText('Criar "Material"'));

    expect(
      screen.getByRole('combobox', { name: /nome do atributo/i })
    ).toHaveTextContent('Material');
  });

  it('should call onRemove with the card index when the remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    renderWithProductProvider(<NewAttributeCardHarness onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: /remover atributo/i }));

    expect(onRemove).toHaveBeenCalledWith(0);
  });
});
