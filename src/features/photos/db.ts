import Dexie, { type Table } from "dexie";
import type { PhotoMeta } from "./photos.slice";

export class PhotobookDB extends Dexie {
  photos!: Table<{ id: string; blob: Blob }>;
  thumbs!: Table<{ id: string; blob: Blob }>;
  meta!: Table<PhotoMeta>;

  constructor() {
    super('photobook');
    this.version(1).stores({
      photos: 'id',
      thumbs: 'id',
      meta: 'id,name,width,height,orientation',
    });
  }
}

export const db = new PhotobookDB();
