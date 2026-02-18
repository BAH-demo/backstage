export interface Config {
  costOptimization?: {
    schedule?: {
      frequency?: { hours?: number; minutes?: number };
      timeout?: { hours?: number; minutes?: number };
      initialDelay?: { minutes?: number };
    };
    cache?: {
      defaultTtl?: { minutes?: number };
      entityTtl?: { minutes?: number };
    };
  };
}
