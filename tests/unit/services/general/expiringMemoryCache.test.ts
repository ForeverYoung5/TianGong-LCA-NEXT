import { ExpiringMemoryCache } from '@/services/general/expiringMemoryCache';

describe('ExpiringMemoryCache', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-19T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates stable cache keys from prefix and arguments', () => {
    const cache = new ExpiringMemoryCache();

    expect(cache.createKey('location', 'en', 'CN,US')).toBe('location:en:CN,US');
  });

  it('stores and retrieves values before expiration', () => {
    const cache = new ExpiringMemoryCache();

    cache.set('foo', { id: 'bar' });

    expect(cache.get<{ id: string }>('foo')).toEqual({ id: 'bar' });
  });

  it('returns null after expiration and removes the stale value', () => {
    const cache = new ExpiringMemoryCache();

    cache.set('foo', { id: 'bar' }, 100);
    jest.advanceTimersByTime(101);

    expect(cache.get<{ id: string }>('foo')).toBeNull();
    expect(cache.get<{ id: string }>('foo')).toBeNull();
  });

  it('clears all stored values', () => {
    const cache = new ExpiringMemoryCache();

    cache.set('foo', 1);
    cache.set('bar', 2);
    cache.clear();

    expect(cache.get<number>('foo')).toBeNull();
    expect(cache.get<number>('bar')).toBeNull();
  });
});
