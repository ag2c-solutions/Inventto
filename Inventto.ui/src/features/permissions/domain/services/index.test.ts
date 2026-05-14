import { describe, expect, it } from 'vitest';

import type { PermissionAction } from '../entities';

import { PermissionService } from './index';

describe('PermissionService.can', () => {
  it('deve retornar false quando role é undefined', () => {
    expect(PermissionService.can(undefined, 'product:view')).toBe(false);
  });

  it('deve retornar true para uma ação que sales tem permissão', () => {
    expect(PermissionService.can('sales', 'product:view')).toBe(true);
  });

  it('deve retornar false para uma ação que sales não tem', () => {
    expect(PermissionService.can('sales', 'product:create')).toBe(false);
  });

  it('deve retornar true para uma ação que manager tem', () => {
    expect(PermissionService.can('manager', 'product:create')).toBe(true);
  });

  it('deve retornar false para uma ação que manager não tem', () => {
    expect(PermissionService.can('manager', 'team:manage')).toBe(false);
  });

  it('deve retornar true para team:manage quando o role é owner', () => {
    expect(PermissionService.can('owner', 'team:manage')).toBe(true);
  });

  it('deve retornar true para org:manage quando o role é owner', () => {
    expect(PermissionService.can('owner', 'org:manage')).toBe(true);
  });

  it('deve retornar true para financial:view quando o role é owner', () => {
    expect(PermissionService.can('owner', 'financial:view')).toBe(true);
  });

  it('deve retornar false para uma PermissionAction inexistente independente do role', () => {
    expect(
      PermissionService.can('owner', 'nonexistent:action' as PermissionAction)
    ).toBe(false);
  });
});
