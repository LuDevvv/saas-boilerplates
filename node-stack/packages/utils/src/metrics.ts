import { EventEmitter } from 'events';

export const metricsEvents = new EventEmitter();

export const METRIC_EVENTS = {
  CACHE_HIT: 'cache_hit',
  CACHE_MISS: 'cache_miss',
  DB_QUERY_DURATION: 'db_query_duration',
} as const;

export function recordCacheHit(): void {
  metricsEvents.emit(METRIC_EVENTS.CACHE_HIT);
}

export function recordCacheMiss(): void {
  metricsEvents.emit(METRIC_EVENTS.CACHE_MISS);
}

export function recordDbQueryDuration(durationSeconds: number, queryType?: string): void {
  metricsEvents.emit(METRIC_EVENTS.DB_QUERY_DURATION, { durationSeconds, queryType });
}
