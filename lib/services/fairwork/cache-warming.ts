import { cacheWarming } from '@/lib/services/cache/warming';

import { FairWorkService } from './fairwork-service';
import type { GetClassificationsParams } from './types';

interface WarmingConfig {
  // How often to refresh award rates (in milliseconds)
  awardRefreshInterval?: number;
  // How many days ahead to pre-warm daily rates
  daysAhead?: number;
  // Priority for different types of cache entries
  priorities?: {
    currentRates?: number;
    futureRates?: number;
    classifications?: number;
    templates?: number;
  };
}

const DEFAULT_CONFIG: Required<WarmingConfig> = {
  awardRefreshInterval: 24 * 60 * 60 * 1000, // 24 hours
  daysAhead: 7, // Pre-warm a week ahead
  priorities: {
    currentRates: 3, // Highest priority
    futureRates: 2,
    classifications: 2,
    templates: 1,
  },
};

export class FairWorkCacheWarming {
  private readonly fairWorkService: FairWorkService;
  private readonly config: Required<WarmingConfig>;

  constructor(fairWorkService: FairWorkService, config: WarmingConfig = {}) {
    this.fairWorkService = fairWorkService;
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      priorities: {
        ...DEFAULT_CONFIG.priorities,
        ...config.priorities,
      },
    };
  }

  public initialize(): void {
    // Register cache warming for current rates
    this.registerCurrentRates();

    // Register cache warming for future rates
    this.registerFutureRates();

    // Register cache warming for classifications
    this.registerClassifications();

    // Register cache warming for templates
    this.registerTemplates();

    // Start the warming process
    cacheWarming.start();
  }

  private registerCurrentRates(): void {
    const { fairWorkService } = this;
    const priority = this.config.priorities.currentRates;

    // Get active awards
    fairWorkService.getActiveAwards().then((awards) => {
      awards.forEach((award) => {
        // Register warming for each award's current rates
        cacheWarming.register({
          key: `rates:${award.code}:current`,
          factory: () => fairWorkService.getCurrentRates(award.code),
          priority,
          ttl: this.config.awardRefreshInterval,
        });

        // Register warming for each award's classifications
        const params: GetClassificationsParams = {
          awardCode: award.code,
          includeInactive: false,
        };

        cacheWarming.register({
          key: `classifications:${award.code}`,
          factory: () => fairWorkService.getClassifications(params),
          priority: this.config.priorities.classifications,
          ttl: this.config.awardRefreshInterval,
        });
      });
    });
  }

  private registerFutureRates(): void {
    const { fairWorkService } = this;
    const priority = this.config.priorities.futureRates;

    // Pre-warm rates for future dates
    fairWorkService.getActiveAwards().then((awards) => {
      const today = new Date();
      const dates = Array.from({ length: this.config.daysAhead }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() + i + 1);
        return date;
      });

      awards.forEach((award) => {
        dates.forEach((date) => {
          const dateStr = date.toISOString().split('T')[0];
          cacheWarming.register({
            key: `rates:${award.code}:${dateStr}`,
            factory: () => fairWorkService.getRatesForDate(award.code, date),
            priority,
            ttl: this.config.awardRefreshInterval,
          });
        });
      });
    });
  }

  private registerClassifications(): void {
    const { fairWorkService } = this;
    const priority = this.config.priorities.classifications;

    // Register warming for classification hierarchies
    fairWorkService.getActiveAwards().then((awards) => {
      awards.forEach((award) => {
        cacheWarming.register({
          key: `classifications:hierarchy:${award.code}`,
          factory: () => fairWorkService.getClassificationHierarchy(award.code),
          priority,
          ttl: this.config.awardRefreshInterval,
        });
      });
    });
  }

  private registerTemplates(): void {
    const { fairWorkService } = this;
    const priority = this.config.priorities.templates;

    // Register warming for rate templates
    fairWorkService.getActiveAwards().then((awards) => {
      awards.forEach((award) => {
        cacheWarming.register({
          key: `templates:${award.code}`,
          factory: () => fairWorkService.getRateTemplates(award.code),
          priority,
          ttl: this.config.awardRefreshInterval,
        });
      });
    });
  }

  public stop(): void {
    cacheWarming.stop();
  }
}

// Export singleton instance
export const fairWorkCacheWarming = new FairWorkCacheWarming(new FairWorkService());
