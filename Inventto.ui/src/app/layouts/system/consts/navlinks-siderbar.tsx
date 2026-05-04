import { ArrowLeftRight, Package, Settings, Users } from 'lucide-react';

import type { NavItem } from '../types';

export const navLinks: NavItem[] = [
  {
    label: 'Equipe',
    href: '/team',
    icon: <Users className="w-5 h-5" />,
    permission: 'team:manage'
  },
  {
    label: 'Produtos',
    href: '/products',
    icon: <Package className="w-5 h-5" />,
    permission: 'product:view'
  },
  {
    label: 'Movimentação',
    href: '/movements',
    icon: <ArrowLeftRight className="w-5 h-5" />,
    permission: 'movement:view'
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
    permission: 'org:manage'
  }
];
