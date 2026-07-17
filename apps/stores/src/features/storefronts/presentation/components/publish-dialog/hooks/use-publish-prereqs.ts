import { useMemo } from 'react';

import { useOrganizationQuery } from '@/features/organizations';

import type { PublishPrereqKey, Storefront } from '../../../../domain/entities';
import { StorefrontService } from '../../../../domain/services';

export interface PublishPrereqItem {
  key: PublishPrereqKey;
  title: string;
  subtitle: string;
  href: string;
  done: boolean;
}

function buildPrereqMeta(storefront: Storefront) {
  return {
    catalog: {
      title: 'Vincule um catálogo',
      subtitle: 'Os produtos e preços vêm do catálogo.',
      href: `/storefronts/${storefront.id}`
    },
    whatsapp: {
      title: 'Informe o WhatsApp',
      subtitle: 'Canal que recebe os pedidos da vitrine.',
      href: `/storefronts/${storefront.id}`
    },
    hours: {
      title: 'Defina fuso e horários',
      subtitle: 'Controla o status de aberto/fechado.',
      href: '/settings?tab=schedule'
    }
  } as const satisfies Record<
    PublishPrereqKey,
    { title: string; subtitle: string; href: string }
  >;
}

// Deriva a lista de pré-requisitos (RN075) direto dos dados já carregados
// (storefront + settings da organização), sem depender do payload de erro
// da RPC — reflete o estado atual mesmo após o vendedor voltar de configurar.
export function usePublishPrereqs(storefront: Storefront) {
  const { data: organization, isLoading } = useOrganizationQuery();

  const missing = useMemo(
    () =>
      StorefrontService.getMissingPrereqs({
        catalogId: storefront.catalogId,
        whatsapp: storefront.whatsapp,
        organizationSettings: organization?.settings
      }),
    [storefront.catalogId, storefront.whatsapp, organization?.settings]
  );

  const items: PublishPrereqItem[] = useMemo(() => {
    const meta = buildPrereqMeta(storefront);

    return (Object.keys(meta) as PublishPrereqKey[]).map((key) => ({
      key,
      ...meta[key],
      done: !missing.includes(key)
    }));
  }, [storefront, missing]);

  const firstPending = items.find((item) => !item.done);

  return {
    items,
    isLoading,
    allDone: missing.length === 0,
    firstPendingHref: firstPending?.href
  };
}
