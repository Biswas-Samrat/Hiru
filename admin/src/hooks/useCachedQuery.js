import { useCallback, useEffect, useState } from 'react';
import { fetchWithCache, getCached } from '../lib/adminCache';

/**
 * @param {string} key
 * @param {() => Promise<any>} fetcher
 * @param {any} defaultValue - used when data is null/undefined
 */
export const useCachedQuery = (key, fetcher, defaultValue = null) => {
  const cached = getCached(key);
  const hasCache = cached !== null && cached !== undefined;
  const initial = hasCache ? cached : defaultValue;

  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(!hasCache);
  const [error, setError] = useState(null);

  const normalize = useCallback(
    (value) => (value === null || value === undefined ? defaultValue : value),
    [defaultValue]
  );

  const refresh = useCallback(
    async (force = false) => {
      const hit = getCached(key);
      if (!force && hit !== null && hit !== undefined) {
        setData(normalize(hit));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await fetchWithCache(key, fetcher, { force });
        setData(normalize(result));
      } catch (err) {
        setError(err);
        setData(defaultValue);
      } finally {
        setLoading(false);
      }
    },
    [key, fetcher, defaultValue, normalize]
  );

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  const setDataSafe = useCallback(
    (updater) => {
      setData((current) => {
        const base = current === null || current === undefined ? defaultValue : current;
        const next = typeof updater === 'function' ? updater(base) : updater;
        return normalize(next);
      });
    },
    [defaultValue, normalize]
  );

  return {
    data: normalize(data),
    loading,
    error,
    refresh,
    setData: setDataSafe,
  };
};
