import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovementApi } from '../../data/api';
import { createMovementInputFactory } from '../../tests/factories/movement.factory';

import { MovementService } from './index';

vi.mock('../../data/api', () => ({
  MovementApi: {
    getAll: vi.fn(),
    getAllForSales: vi.fn(),
    create: vi.fn(),
    cancelConfirmedSale: vi.fn()
  }
}));

describe('MovementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    const organization = {
      id: faker.string.uuid(),
      name: faker.company.name()
    };

    it('should route manager/owner to MovementApi.getAll with the filters', async () => {
      vi.mocked(MovementApi.getAll).mockResolvedValue([]);

      await MovementService.getAll({
        organization,
        role: 'manager',
        productId: 'prod-1'
      });

      expect(MovementApi.getAll).toHaveBeenCalledWith({
        organizationId: organization.id,
        productId: 'prod-1'
      });
      expect(MovementApi.getAllForSales).not.toHaveBeenCalled();
    });

    it('MOV-08: should route sales to the sanitized MovementApi.getAllForSales', async () => {
      vi.mocked(MovementApi.getAllForSales).mockResolvedValue([]);

      await MovementService.getAll({ organization, role: 'sales' });

      expect(MovementApi.getAllForSales).toHaveBeenCalledWith({
        organizationId: organization.id,
        productId: undefined
      });
      expect(MovementApi.getAll).not.toHaveBeenCalled();
    });

    it('should throw when organization is null', async () => {
      await expect(
        MovementService.getAll({ organization: null, role: 'manager' })
      ).rejects.toThrow('Nenhuma organização selecionada.');

      expect(MovementApi.getAll).not.toHaveBeenCalled();
    });

    it('should throw when the role is missing', async () => {
      await expect(MovementService.getAll({ organization })).rejects.toThrow(
        'Usuário sem cargo.'
      );

      expect(MovementApi.getAll).not.toHaveBeenCalled();
      expect(MovementApi.getAllForSales).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should delegate to MovementApi.create with orgId extracted from organization', async () => {
      vi.mocked(MovementApi.create).mockResolvedValue('new-movement-id');

      const input = createMovementInputFactory.build();
      const organization = {
        id: faker.string.uuid(),
        name: faker.company.name()
      };

      const result = await MovementService.create({ input, organization });

      expect(MovementApi.create).toHaveBeenCalledWith({
        input,
        organizationId: organization.id
      });
      expect(result).toBe('new-movement-id');
    });

    it('should throw when organization is null', async () => {
      await expect(
        MovementService.create({
          input: createMovementInputFactory.build(),
          organization: null
        })
      ).rejects.toThrow('Nenhuma organização selecionada.');

      expect(MovementApi.create).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by MovementApi.create', async () => {
      vi.mocked(MovementApi.create).mockRejectedValue(
        new Error('A operação resultaria em estoque negativo (não permitido).')
      );

      await expect(
        MovementService.create({
          input: createMovementInputFactory.build(),
          organization: { id: faker.string.uuid(), name: faker.company.name() }
        })
      ).rejects.toThrow(
        'A operação resultaria em estoque negativo (não permitido).'
      );
    });
  });

  describe('cancelConfirmedSale', () => {
    it('should delegate to MovementApi.cancelConfirmedSale with orderId and trimmed reason', async () => {
      vi.mocked(MovementApi.cancelConfirmedSale).mockResolvedValue(
        'new-movement-id'
      );

      const result = await MovementService.cancelConfirmedSale({
        orderId: 'order-1',
        reason: '  Cliente desistiu  '
      });

      expect(MovementApi.cancelConfirmedSale).toHaveBeenCalledWith({
        orderId: 'order-1',
        reason: 'Cliente desistiu'
      });
      expect(result).toBe('new-movement-id');
    });

    it('should throw when orderId is missing', async () => {
      await expect(
        MovementService.cancelConfirmedSale({ orderId: '', reason: 'motivo' })
      ).rejects.toThrow('Nenhuma venda selecionada para estornar.');

      expect(MovementApi.cancelConfirmedSale).not.toHaveBeenCalled();
    });

    it('should throw when reason is empty or only whitespace', async () => {
      await expect(
        MovementService.cancelConfirmedSale({
          orderId: 'order-1',
          reason: '   '
        })
      ).rejects.toThrow('Informe o motivo do estorno.');

      expect(MovementApi.cancelConfirmedSale).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by MovementApi.cancelConfirmedSale', async () => {
      vi.mocked(MovementApi.cancelConfirmedSale).mockRejectedValue(
        new Error('Esta venda já foi estornada ou não está mais confirmada.')
      );

      await expect(
        MovementService.cancelConfirmedSale({
          orderId: 'order-1',
          reason: 'motivo'
        })
      ).rejects.toThrow(
        'Esta venda já foi estornada ou não está mais confirmada.'
      );
    });
  });
});
