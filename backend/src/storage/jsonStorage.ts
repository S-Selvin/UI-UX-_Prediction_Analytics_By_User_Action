import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../../data');

// Simple async mutex for safe concurrent writes per collection
const collectionLocks: Record<string, Promise<void>> = {};

async function acquireLock(collection: string): Promise<() => void> {
  let release: () => void;
  const newLock = new Promise<void>(resolve => {
    release = resolve;
  });

  const oldLock = collectionLocks[collection] || Promise.resolve();
  collectionLocks[collection] = oldLock.then(() => newLock);
  
  await oldLock;
  return release!;
}

// Ensures the data directory and specific collection JSON file exist
async function ensureCollection(collection: string) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, `${collection}.json`);
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '[]', 'utf-8');
  }
  return filePath;
}

export async function readCollection<T>(collection: string): Promise<T[]> {
  const release = await acquireLock(collection);
  try {
    const filePath = await ensureCollection(collection);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T[];
  } catch (error) {
    console.error(`Error reading collection ${collection}:`, error);
    return [];
  } finally {
    release();
  }
}

export async function writeCollection<T>(collection: string, data: T[]): Promise<void> {
  const release = await acquireLock(collection);
  try {
    const filePath = await ensureCollection(collection);
    const tempFilePath = `${filePath}.tmp`;
    await fs.writeFile(tempFilePath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempFilePath, filePath);
  } catch (error) {
    console.error(`Error writing collection ${collection}:`, error);
  } finally {
    release();
  }
}

// Helper methods that manage reading and writing internally using locks
export async function insert<T>(collection: string, item: T): Promise<void> {
  const release = await acquireLock(collection);
  try {
    const filePath = await ensureCollection(collection);
    const dataStr = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(dataStr) as T[];
    data.push(item);
    const tempFilePath = `${filePath}.tmp`;
    await fs.writeFile(tempFilePath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempFilePath, filePath);
  } catch (error) {
    console.error(`Error inserting into ${collection}:`, error);
  } finally {
    release();
  }
}

export async function upsert<T>(
  collection: string, 
  item: T, 
  predicate: (i: T) => boolean, 
  updateFn: (existing: T) => T
): Promise<void> {
  const release = await acquireLock(collection);
  try {
    const filePath = await ensureCollection(collection);
    const dataStr = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(dataStr) as T[];
    
    const index = data.findIndex(predicate);
    if (index >= 0) {
      data[index] = updateFn(data[index]);
    } else {
      data.push(item);
    }
    
    const tempFilePath = `${filePath}.tmp`;
    await fs.writeFile(tempFilePath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempFilePath, filePath);
  } catch (error) {
    console.error(`Error upserting into ${collection}:`, error);
  } finally {
    release();
  }
}

// Pre-initialize required collections
export const initializeStorage = async () => {
  const requiredCollections = [
    'websites', 'users', 'sessions', 'events', 
    'behavior_features', 'predictions', 'recommendations'
  ];
  for (const collection of requiredCollections) {
    const release = await acquireLock(collection);
    try {
      await ensureCollection(collection);
    } finally {
      release();
    }
  }
};
