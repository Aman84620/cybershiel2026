import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.resolve('database.json');

// Helper to load database
async function loadDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const defaultData = { analyses: [], complaints: [] };
      await fs.writeFile(DB_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    throw err;
  }
}

// Helper to save database
async function saveDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

export async function saveAnalysis(data) {
  const dbStore = await loadDB();
  const id = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  const record = { ...data, id, timestamp: new Date().toISOString() };
  dbStore.analyses.push(record);
  
  await saveDB(dbStore);
  return id;
}

export async function getAnalyses() {
  const dbStore = await loadDB();
  return dbStore.analyses.slice().reverse().slice(0, 100);
}

export async function saveComplaint(data) {
  const dbStore = await loadDB();
  const id = `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  const record = { ...data, id, timestamp: new Date().toISOString() };
  dbStore.complaints.push(record);
  
  await saveDB(dbStore);
  return id;
}

export async function getComplaints() {
  const dbStore = await loadDB();
  return dbStore.complaints.slice().reverse().slice(0, 100);
}

// Dummy export to keep external imports from failing
export const db = null;
