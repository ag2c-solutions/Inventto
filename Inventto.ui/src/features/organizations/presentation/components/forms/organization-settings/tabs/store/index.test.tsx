import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { Form } from '@/shared/components/ui/form';

import type { OrganizationSettingsFormData } from '../../schema';
import { organizationSettingsFormDataFactory } from '../../schema/organization-settings-form-data.factory';

vi.mock('../../../../actions/logo-change', () => ({
  LogoChange: ({ currentLogoSrc }: { currentLogoSrc?: string }) => (
    <div data-testid="logo-change">{currentLogoSrc ?? 'sem-logo'}</div>
  )
}));

import { StoreTabContent } from '.';

function Wrapper({
  defaultValues,
  handleCepBlur = vi.fn(),
  cepLoading = false
}: {
  defaultValues: OrganizationSettingsFormData;
  handleCepBlur?: (cep: string) => void;
  cepLoading?: boolean;
}) {
  const form = useForm<OrganizationSettingsFormData>({ defaultValues });
  return (
    <Form {...form}>
      <StoreTabContent
        form={form}
        isSaving={false}
        logoPreview={undefined}
        handleLogoChange={vi.fn()}
        handleCepBlur={handleCepBlur}
        cepLoading={cepLoading}
      />
    </Form>
  );
}

describe('StoreTabContent', () => {
  const user = userEvent.setup();

  it('exibe os campos de nome, documento e endereço', () => {
    const defaultValues = organizationSettingsFormDataFactory.build();

    render(<Wrapper defaultValues={defaultValues} />);

    expect(
      screen.getByPlaceholderText('Ex: Boutique da Ana')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('CPF ou CNPJ')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('00000-000')).toBeInTheDocument();
  });

  it('formata o documento digitado (CPF/CNPJ)', async () => {
    const defaultValues = organizationSettingsFormDataFactory.build({
      document: ''
    });

    render(<Wrapper defaultValues={defaultValues} />);

    const documentInput = screen.getByPlaceholderText('CPF ou CNPJ');
    await user.type(documentInput, '12345678000190');

    expect(documentInput).toHaveValue('12.345.678/0001-90');
  });

  it('chama handleCepBlur com o valor digitado ao sair do campo CEP', async () => {
    const handleCepBlur = vi.fn();
    const defaultValues = organizationSettingsFormDataFactory.build();

    render(
      <Wrapper defaultValues={defaultValues} handleCepBlur={handleCepBlur} />
    );

    const cepInput = screen.getByPlaceholderText('00000-000');
    await user.type(cepInput, '01310100');
    await user.tab();

    expect(handleCepBlur).toHaveBeenCalledWith('01310100');
  });

  it('exibe o indicador de carregamento do CEP quando cepLoading é true', () => {
    const defaultValues = organizationSettingsFormDataFactory.build();

    const { container } = render(
      <Wrapper defaultValues={defaultValues} cepLoading />
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('passa o logo atual para o LogoChange', () => {
    const defaultValues = organizationSettingsFormDataFactory.build({
      identity: { logoUrl: 'https://cdn/logo.png' }
    });

    render(<Wrapper defaultValues={defaultValues} />);

    expect(screen.getByTestId('logo-change')).toHaveTextContent(
      'https://cdn/logo.png'
    );
  });
});
