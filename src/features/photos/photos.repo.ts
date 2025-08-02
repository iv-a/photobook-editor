import { db } from "./db";
import type { PhotoMeta } from "./photos.slice";

export const decodeImage = async (file: Blob) => {
  if ('createImageBitmap' in window) {
    const bmp = await createImageBitmap(file);
    const res = { width: bmp.width, height: bmp.height };
    bmp.close?.();
    return res;
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src =  url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
    });
    return  { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const makeThumb = async (file: Blob, max: number): Promise<Blob> => {
  const { width, height } = await decodeImage(file);
  const scale = Math.min(1, max / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const url = URL.createObjectURL(file);
  try {
    const img= new Image();
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
    });
    ctx.drawImage(img, 0, 0, w, h);
  } finally {
    URL.revokeObjectURL(url);
  }
  const preferWebP = 'image/webp';
  const blob: Blob = await new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, preferWebP, 0.85);
  });
  return blob;
}

export const importFilesToDB = async (files: File[]) => {
  const out: PhotoMeta[] = [];
  await db.transaction('readwrite', db.photos, db.thumbs, db.meta, async () => {
    for (const file of files) {
      const id = crypto.randomUUID();
      const {width, height} = await decodeImage(file); 
      const thumb = await makeThumb(file, 512);
      await db.photos.put({ id, blob: file });
      await db.thumbs.put({ id, blob: thumb });
      const meta: PhotoMeta = { id, name: file.name, width, height };
      await db.meta.put(meta);
      out.push(meta);
    }
  });
  return out;
};

export const readAllMeta = async () => {
  return await db.meta.toArray();
};

export const removeManyFromDB = async (ids: string[]) => {
  await db.transaction('readwrite', db.photos, db.thumbs, db.meta, async () => {
    await db.photos.bulkDelete(ids);
    await db.thumbs.bulkDelete(ids);
    await db.meta.bulkDelete(ids);
  });
}
