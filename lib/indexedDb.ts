import { openDB } from 'idb';

const DB_NAME = 'subdealers-cache';
const STORE_NAME = 'cache';

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function setItem<T = any>(key: string, value: T) {
  const db = await getDb();
  return db.put(STORE_NAME, value, key);
}

export async function getItem<T = any>(key: string): Promise<T | undefined> {
  const db = await getDb();
  return db.get(STORE_NAME, key);
}

export async function removeItem(key: string) {
  const db = await getDb();
  return db.delete(STORE_NAME, key);
}

export async function clear() {
  const db = await getDb();
  return db.clear(STORE_NAME);
}
