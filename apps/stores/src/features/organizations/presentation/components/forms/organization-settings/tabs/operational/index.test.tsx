import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { Form } from '@/shared/components/ui/form';

import type { OrganizationSettingsFormData } from '../../schema';
import { organizationSettingsFormDataFactory } from '../../schema/organization-settings-form-data.factory';

import { OperationalTabContent } from '.';

function Wrapper({
  defaultValues
}: {
  defaultValues: OrganizationSettingsFormData;
}) {
  const form = useForm<OrganizationSettingsFormData>({ defaultValues });
  return (
    <Form {...form}>
      <OperationalTabContent form={form} />
    </Form>
  );
}

describe('OperationalTabContent', () => {
  const user = userEvent.setup();

  // Radix Select usa Pointer Capture, ausente no jsdom.
  beforeAll(() => {
    Element.prototype.hasPointerCapture = vi.fn();
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  it('exibe o fuso horário atual do formulário', () => {
    const defaultValues = organizationSettingsFormDataFactory.build({
      operational: { timezone: 'America/Sao_Paulo' }
    });

    render(<Wrapper defaultValues={defaultValues} />);

    expect(screen.getByText('Brasília (GMT-3)')).toBeInTheDocument();
  });

  it('lista as opções de fuso horário disponíveis ao abrir o select', async () => {
    const defaultValues = organizationSettingsFormDataFactory.build();

    render(<Wrapper defaultValues={defaultValues} />);

    await user.click(screen.getByRole('combobox'));

    expect(
      await screen.findByRole('option', { name: 'Manaus (GMT-4)' })
    ).toBeInTheDocument();
  });

  it('exibe o switch de aceitar pedidos fora do horário desmarcado por padrão', () => {
    const defaultValues = organizationSettingsFormDataFactory.build({
      sales: { acceptOrdersOutsideHours: false }
    });

    render(<Wrapper defaultValues={defaultValues} />);

    expect(screen.getByRole('switch')).toHaveAttribute(
      'data-state',
      'unchecked'
    );
  });

  it('marca o switch quando ativado pelo usuário', async () => {
    const defaultValues = organizationSettingsFormDataFactory.build({
      sales: { acceptOrdersOutsideHours: false }
    });

    render(<Wrapper defaultValues={defaultValues} />);

    await user.click(screen.getByRole('switch'));

    expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked');
  });
});
