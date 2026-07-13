import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { SalesSeriesPointDTO, SalesSummaryDTO } from '../../data/dtos';
import type { SalesSeriesPoint, SalesSummary } from '../../domain/entities';

const salesSeriesPointFactory = Factory.define<SalesSeriesPoint>(() => ({
  date: faker.date.recent().toISOString(),
  pos: faker.number.int({ min: 0, max: 1000 }),
  online: faker.number.int({ min: 0, max: 1000 })
}));

const salesSeriesPointDTOFactory = Factory.define<SalesSeriesPointDTO>(() => ({
  date: faker.date.recent().toISOString(),
  pos: faker.number.int({ min: 0, max: 1000 }),
  online: faker.number.int({ min: 0, max: 1000 })
}));

export const salesSummaryFactory = Factory.define<SalesSummary>(() => ({
  revenueTotal: faker.number.int({ min: 0, max: 20000 }),
  salesCount: faker.number.int({ min: 0, max: 100 }),
  series: salesSeriesPointFactory.buildList(3),
  trend: faker.number.int({ min: -50, max: 50 }),
  inventoryAtCost: faker.number.int({ min: 0, max: 50000 }),
  avgMargin: faker.number.float({ min: 0, max: 1, fractionDigits: 4 })
}));

export const salesSummaryDTOFactory = Factory.define<SalesSummaryDTO>(() => ({
  revenue_total: faker.number.int({ min: 0, max: 20000 }),
  sales_count: faker.number.int({ min: 0, max: 100 }),
  series: salesSeriesPointDTOFactory.buildList(3),
  trend: faker.number.int({ min: -50, max: 50 }),
  inventory_at_cost: faker.number.int({ min: 0, max: 50000 }),
  avg_margin: faker.number.float({ min: 0, max: 1, fractionDigits: 4 })
}));
