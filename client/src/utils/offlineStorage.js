import { openDB } from 'idb';

const DB_NAME = 'foodSafetyDB';
const DB_VERSION = 1;
const STORE_NAME = 'offlineRecords';

// Initialize the database
const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    },
  });
  return db;
};

// Save a record for offline storage
export const saveOfflineRecord = async (record) => {
  try {
    const db = await initDB();
    const id = await db.add(STORE_NAME, {
      ...record,
      timestamp: new Date().toISOString(),
      offline: true,
    });
    return id;
  } catch (error) {
    console.error('Error saving offline record:', error);
    throw error;
  }
};

// Get all offline records
export const getOfflineRecords = async () => {
  try {
    const db = await initDB();
    return await db.getAll(STORE_NAME);
  } catch (error) {
    console.error('Error getting offline records:', error);
    throw error;
  }
};

// Delete an offline record after successful sync
export const deleteOfflineRecord = async (id) => {
  try {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
  } catch (error) {
    console.error('Error deleting offline record:', error);
    throw error;
  }
};

// Check if we're online
export const isOnline = () => {
  return navigator.onLine;
};

// Add online/offline event listeners
export const setupNetworkListeners = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
};

// Remove online/offline event listeners
export const removeNetworkListeners = (onOnline, onOffline) => {
  window.removeEventListener('online', onOnline);
  window.removeEventListener('offline', onOffline);
};

// Sync offline records when coming back online
export const syncOfflineRecords = async () => {
  if (!isOnline()) return;

  try {
    const records = await getOfflineRecords();
    
    for (const record of records) {
      try {
        const response = await fetch('/api/records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(record),
        });

        if (response.ok) {
          await deleteOfflineRecord(record.id);
        }
      } catch (error) {
        console.error('Failed to sync record:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}; 