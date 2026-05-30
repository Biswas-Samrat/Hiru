const TTL_MS = 45_000;
const cache = new Map();

export const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

export const setCached = (key, data) => {
  cache.set(key, { data, at: Date.now() });
};

export const invalidateCache = (key) => {
  if (key) cache.delete(key);
  else cache.clear();
};

export const fetchWithCache = async (key, fetcher, { force = false } = {}) => {
  if (!force) {
    const hit = getCached(key);
    if (hit !== null) return hit;
  }
  const data = await fetcher();
  setCached(key, data);
  return data;
};
