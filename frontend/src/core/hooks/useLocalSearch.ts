import { useMemo } from 'react';
import Fuse from 'fuse.js';

export function useLocalSearch<T>(list: T[], keys: string[], query: string): T[] {
  const fuse = useMemo(() => {
    return new Fuse(list, {
      keys,
      threshold: 0.3,
      distance: 100,
    });
  }, [list, keys]);

  return useMemo(() => {
    if (!query.trim()) return list;
    return fuse.search(query).map((res) => res.item);
  }, [fuse, query, list]);
}
