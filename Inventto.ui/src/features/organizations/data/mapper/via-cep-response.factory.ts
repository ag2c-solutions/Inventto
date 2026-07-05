import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { ViaCEPResponseDTO } from '@/infra/viacep';

/**
 * Test-only factory for the ViaCEP integration response shape. Lives beside
 * the mapper, not in the feature's shared `tests/factories/`, since that
 * folder is reserved for this feature's own Domain/DTO and importing an
 * `infra/` type from there would violate the `boundaries/dependencies`
 * eslint rule (`feature-tests` cannot depend on `infra`). `data/mapper` is
 * the layer that legitimately references `infra/viacep` (see
 * `references/api/mappers.md` — mapper pode importar tipo de DTO externo).
 */
export const viaCepResponseDTOFactory = Factory.define<ViaCEPResponseDTO>(
  () => ({
    cep: '01310-100',
    logradouro: faker.location.street(),
    complemento: '',
    bairro: faker.location.county(),
    localidade: faker.location.city(),
    uf: faker.location.state({ abbreviated: true })
  })
);
