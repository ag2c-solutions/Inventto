import { ArrowLeftRight, Package, Settings, Users } from 'lucide-react';

import type { NavItem } from '../types';

export const navLinks: NavItem[] = [
  {
    label: 'Equipe',
    href: '/team',
    icon: Users,
    permission: 'team:manage'
  },
  {
    label: 'Produtos',
    href: '/products',
    icon: Package,
    permission: 'product:view'
  },
  {
    label: 'Movimentação',
    href: '/movements',
    icon: ArrowLeftRight,
    permission: 'movement:view'
  },
  {
    label: 'Configurações',
    href: '/settings',
    icon: Settings,
    permission: 'org:manage'
  }
];
