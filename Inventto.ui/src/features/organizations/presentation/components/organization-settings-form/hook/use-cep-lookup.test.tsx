import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseLookupCepQuery } = vi.hoisted(() => ({
  mockUseLookupCepQuery: vi.fn()
}));

vi.mock('../../../hooks/use-queries', () => ({
  useLookupCepQuery: mockUseLookupCepQuery
}));

import {
  defaultSettingsValues,
  type OrganizationSettingsFormData
} from '../schema';

import { useCepLookup } from './use-cep-lookup';

const address = {
  zip: '01310-100',
  street: 'Av. Paulista',
  number: '',
  district: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP'
};

function setup() {
  return renderHook(() => {
    const form = useForm<OrganizationSettingsFormData>({
      defaultValues: defaultSettingsValues
    });
    const cep = useCepLookup(form);
    return { form, cep };
  });
}

describe('useCepLookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('preenche os campos de endereço quando o CEP é encontrado', () => {
    mockUseLookupCepQuery.mockReturnValue({ data: address, isFetching: false });

    const { result } = setup();

    expect(result.current.form.getValues('address.zip')).toBe('01310-100');
    expect(result.current.form.getValues('address.street')).toBe(
      'Av. Paulista'
    );
    expect(result.current.form.getValues('address.district')).toBe(
      'Bela Vista'
    );
    expect(result.current.form.getValues('address.city')).toBe('São Paulo');
    expect(result.current.form.getValues('address.state')).toBe('SP');
  });

  it('não altera o endereço quando não há resultado', () => {
    mockUseLookupCepQuery.mockReturnValue({
      data: undefined,
      isFetching: false
    });

    const { result } = setup();

    expect(result.current.form.getValues('address.zip')).toBe('');
  });

  it('expõe cepLoading a partir de isFetching', () => {
    mockUseLookupCepQuery.mockReturnValue({
      data: undefined,
      isFetching: true
    });

    const { result } = setup();

    expect(result.current.cep.cepLoading).toBe(true);
  });

  it('handleCepBlur só dispara a busca com CEP de 8 dígitos', () => {
    mockUseLookupCepQuery.mockReturnValue({
      data: undefined,
      isFetching: false
    });

    const { result } = setup();

    act(() => result.current.cep.handleCepBlur('123'));
    expect(mockUseLookupCepQuery.mock.calls.at(-1)?.[0]).toBe('');

    act(() => result.current.cep.handleCepBlur('01310-100'));
    expect(mockUseLookupCepQuery.mock.calls.at(-1)?.[0]).toBe('01310-100');
  });
});
