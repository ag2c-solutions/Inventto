import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

/**
 * Formato estrutural de `Organization` (`@/features/organizations`), usado
 * apenas como parâmetro em `ProductService`. Não importamos o tipo de outra
 * feature aqui: `eslint-plugin-boundaries` proíbe `tests/` de depender de
 * outra feature, e a compatibilidade estrutural do TypeScript garante que
 * este shape seja aceito onde `Organization` for esperado.
 */
interface OrganizationLike {
  id: string;
  name: string;
}

export const organizationFactory = Factory.define<OrganizationLike>(() => ({
  id: faker.string.uuid(),
  name: faker.company.name()
}));
