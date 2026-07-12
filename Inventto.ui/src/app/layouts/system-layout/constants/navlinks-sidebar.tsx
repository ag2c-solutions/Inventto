import {
  ArrowRightLeft,
  ClipboardList,
  Layers,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users
} from 'lucide-react';

import type { NavGroup } from '../types';

export const navGroups: NavGroup[] = [
  {
    group: 'OPERAÇÃO',
    items: [
      {
        label: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        enabled: false
      },
      {
        label: 'Pedidos',
        href: '/pedidos',
        icon: ClipboardList,
        permission: 'order:view_own',
        enabled: true
      },
      {
        label: 'Venda no balcão',
        href: '/pdv',
        icon: ShoppingCart,
        permission: 'order:view_own',
        enabled: true
      }
    ]
  },
  {
    group: 'INVENTÁRIO',
    items: [
      {
        label: 'Produtos',
        href: '/products',
        icon: Package,
        permission: 'product:view',
        enabled: true
      },
      {
        label: 'Movimentações',
        href: '/movements',
        icon: ArrowRightLeft,
        permission: 'movement:view',
        enabled: true
      },
      {
        label: 'Catálogos',
        href: '/catalogos',
        icon: Layers,
        permission: 'catalog:view',
        enabled: true
      },
      {
        label: 'Vitrines',
        href: '/storefronts',
        icon: Store,
        permission: 'storefront:manage',
        enabled: true
      }
    ]
  },
  {
    group: 'ADMINISTRAÇÃO',
    items: [
      {
        label: 'Equipe',
        href: '/team',
        icon: Users,
        permission: 'team:manage',
        enabled: true
      },
      {
        label: 'Organização',
        href: '/settings',
        icon: Settings,
        permission: 'org:manage',
        enabled: true
      }
    ]
  }
];
