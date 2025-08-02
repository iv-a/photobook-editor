import Dexie, { type Table } from "dexie";
import type { PhotoMeta } from "./photos.slice";

export class PhotobookDB extends Dexie {
  photos!: Table<{ id: string; blob: Blob }>;
  thumbs!: Table<{ id: string; blob: Blob }>;
  meta!: Table<PhotoMeta>;
  pairs!: Table<{ id: string; leftId: string; rightId: string; createdAt: number }>;

  constructor() {
    super('photobook');
    this.version(2).stores({
      photos: 'id',
      thumbs: 'id',
      meta: 'id,name,width,height,orientation',
      pairs: 'id',
    });
  }
}

export const db = new PhotobookDB();
