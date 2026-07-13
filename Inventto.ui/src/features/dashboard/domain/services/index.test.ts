import { describe, expect, it } from 'vitest';

import type { OnboardingStatus } from '../entities';

import { DashboardService, OnboardingService } from '.';

describe('DashboardService', () => {
  it('should show the chart and owner-only extras for the owner', () => {
    const view = DashboardService.getRoleView('owner');

    expect(view.showSalesChart).toBe(true);
    expect(view.showOwnerExtras).toBe(true);
  });

  it('should show the chart for the manager without owner extras', () => {
    const view = DashboardService.getRoleView('manager');

    expect(view.showSalesChart).toBe(true);
    expect(view.showOwnerExtras).toBe(false);
  });

  it('should hide the chart and owner extras for sales', () => {
    const view = DashboardService.getRoleView('sales');

    expect(view.showSalesChart).toBe(false);
    expect(view.showOwnerExtras).toBe(false);
  });
});

const EMPTY_STATUS: OnboardingStatus = {
  hasProducts: false,
  hasCatalog: false,
  hasPublishedStorefront: false,
  hasSales: false
};

describe('OnboardingService', () => {
  describe('resolveSteps', () => {
    it('should mark only the first step as active when nothing is done', () => {
      const steps = OnboardingService.resolveSteps(EMPTY_STATUS);

      expect(steps.map((s) => [s.id, s.done, s.active])).toEqual([
        ['product', false, true],
        ['catalog', false, false],
        ['storefront', false, false]
      ]);
    });

    it('should activate the second step only after the first is done', () => {
      const steps = OnboardingService.resolveSteps({
        ...EMPTY_STATUS,
        hasProducts: true
      });

      expect(steps.map((s) => [s.id, s.done, s.active])).toEqual([
        ['product', true, false],
        ['catalog', false, true],
        ['storefront', false, false]
      ]);
    });

    it('should activate the third step only after the first two are done', () => {
      const steps = OnboardingService.resolveSteps({
        ...EMPTY_STATUS,
        hasProducts: true,
        hasCatalog: true
      });

      expect(steps.map((s) => [s.id, s.done, s.active])).toEqual([
        ['product', true, false],
        ['catalog', true, false],
        ['storefront', false, true]
      ]);
    });

    it('should mark every step done and none active when all criteria are met', () => {
      const steps = OnboardingService.resolveSteps({
        ...EMPTY_STATUS,
        hasProducts: true,
        hasCatalog: true,
        hasPublishedStorefront: true
      });

      expect(steps.every((s) => s.done)).toBe(true);
      expect(steps.some((s) => s.active)).toBe(false);
    });

    it('should not activate a step out of order even if a later criterion is met', () => {
      const steps = OnboardingService.resolveSteps({
        ...EMPTY_STATUS,
        hasPublishedStorefront: true
      });

      expect(steps.map((s) => [s.id, s.done, s.active])).toEqual([
        ['product', false, true],
        ['catalog', false, false],
        ['storefront', true, false]
      ]);
    });
  });

  describe('shouldShowOnboarding', () => {
    it('should show onboarding for a brand new org', () => {
      expect(OnboardingService.shouldShowOnboarding(EMPTY_STATUS)).toBe(true);
    });

    it('should keep showing onboarding mid-progress', () => {
      expect(
        OnboardingService.shouldShowOnboarding({
          ...EMPTY_STATUS,
          hasProducts: true,
          hasCatalog: true
        })
      ).toBe(true);
    });

    it('should hide onboarding once all 3 steps are done', () => {
      expect(
        OnboardingService.shouldShowOnboarding({
          hasProducts: true,
          hasCatalog: true,
          hasPublishedStorefront: true,
          hasSales: false
        })
      ).toBe(false);
    });

    it('should hide onboarding when sales already happened, even with pending steps', () => {
      expect(
        OnboardingService.shouldShowOnboarding({
          ...EMPTY_STATUS,
          hasSales: true
        })
      ).toBe(false);
    });
  });
});
