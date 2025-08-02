import { db } from "./db";

const mem = new  Map<string, { url: string; lastUsed: number  }>();
const LIMIT = 300;

const evicitIfNeeded = () => {
  if (mem.size <= LIMIT) {
    return;
  }

  let oldestKey: string | null = null;
  let oldest = Infinity;
  for (const [key, value] of mem) {
    if (value.lastUsed < oldest) {
      oldest = value.lastUsed;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    const { url } = mem.get(oldestKey)!;
    URL.revokeObjectURL(url);
    mem.delete(oldestKey);
  }
};

export const getUrl = async (id: string, preferThumb = true) => {
  const hit = mem.get(id);
  if (hit) {
    hit.lastUsed = performance.now();
    return hit.url;
  }
  const blob = (preferThumb ? (await db.thumbs.get(id))?.blob : undefined) ?? (await db.photos.get(id))?.blob;
  if (!blob) {
    return undefined;
  }
  const url = URL.createObjectURL(blob);
  mem.set(id, { url, lastUsed: performance.now() });
  evicitIfNeeded();
  return url;
};

export const revokeUrl = (id: string) => {
  const e = mem.get(id);
  if (e) {
    URL.revokeObjectURL(e.url);
    mem.delete(id);
  }
};

export const revokeMany = (ids: string[]) => {
  for (const id of ids) {
    revokeUrl(id);
  }
};

export const revokeAll = () => {
  for (const id of Array.from(mem.keys())) {
    revokeUrl(id);
  }
};

export const seedTemp = (id: string, file: Blob) => {
  const url = URL.createObjectURL(file);
  mem.set(id, { url, lastUsed: performance.now() });
  evicitIfNeeded();
  return url;
}
