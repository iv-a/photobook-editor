import { db } from "./db";

type Variant = 'thumb' | 'orig';
type Entry = { url: string; lastUsed: number };

const mem = new  Map<string, Entry>();
const LIMIT = 1000;

const k = (id: string, v: Variant) => `${id}|${v}`;

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

export const seedTemp = (id: string, file: Blob) => {
  const key = k(id, 'orig');
  if (mem.has(key)) return mem.get(key)!.url;
  const url = URL.createObjectURL(file);
  mem.set(key, { url, lastUsed: performance.now() });
  evicitIfNeeded();
  return url;
}

 const ensureUrl = async (id: string, variant: Variant): Promise<string | undefined> => {
  const key = k(id, variant);
  const hit = mem.get(key);
  if (hit) { hit.lastUsed = performance.now(); return hit.url; }

  const rec =
    variant === 'thumb'
      ? await db.thumbs.get(id)
      : await db.photos.get(id);

  const blob = rec?.blob;
  if (!blob) return undefined;

  const url = URL.createObjectURL(blob);
  mem.set(key, { url, lastUsed: performance.now() });
  evicitIfNeeded();
  return url;
}

export const getThumbUrl = async (id: string) => {
  return ensureUrl(id, 'thumb');
}
export const getOriginalUrl= async(id: string) => {
  return ensureUrl(id, 'orig');
}

const revokeVariant = (id: string, v: Variant) => {
  const key = k(id, v);
  const e = mem.get(key);
  if (e) { URL.revokeObjectURL(e.url); mem.delete(key); }
}

export const revokeUrl = (id: string) => {
  revokeVariant(id, 'thumb');
  revokeVariant(id, 'orig');
}

export const revokeMany =(ids: string[]) => {
  ids.forEach(revokeUrl);
}
export const revokeAll = () => {
  for (const key of Array.from(mem.keys())) {
    const e = mem.get(key)!;
    URL.revokeObjectURL(e.url);
    mem.delete(key);
  }
}
