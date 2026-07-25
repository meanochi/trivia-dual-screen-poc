import { openDB, type IDBPDatabase } from 'idb';
import type { GameState } from './types';

const DB_NAME = 'trivia-poc';
const STORE = 'kv';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE);
      },
    });
  }
  return dbPromise;
}

export interface PersistedData {
  state: GameState;
  history: GameState[];
}

export async function loadPersisted(): Promise<PersistedData | null> {
  try {
    const db = await getDb();
    const data = (await db.get(STORE, 'game')) as PersistedData | undefined;
    return data ?? null;
  } catch {
    return null;
  }
}

export async function savePersisted(data: PersistedData): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE, data, 'game');
  } catch {
    // כשל שמירה לא עוצר את המשחק
  }
}

export async function clearPersisted(): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORE, 'game');
  } catch {
    // התעלמות
  }
}
