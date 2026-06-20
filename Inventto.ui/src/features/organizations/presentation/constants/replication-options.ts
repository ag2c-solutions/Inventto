import type { CreateOrganizationFormValues } from '../../domain/validators';

export const REPLICATION_OPTIONS: {
  value: NonNullable<CreateOrganizationFormValues['replicateGroups']>[number];
  label: string;
}[] = [
  { value: 'categories', label: 'Categorias e atributos' },
  { value: 'operational', label: 'Configurações operacionais' },
  { value: 'visual', label: 'Configurações visuais de catálogo' }
];
