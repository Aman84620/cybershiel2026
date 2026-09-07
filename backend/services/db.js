import fs from 'fs/promises';
import path from 'path';
import { isMongoDBConnected } from '../config/db.js';
import User from '../models/User.js';
import Analysis from '../models/Analysis.js';
import Complaint from '../models/Complaint.js';

const DB_FILE = path.resolve('database.json');

// Helper to load JSON database backup
async function loadDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.users) parsed.users = [];
    return parsed;
  } catch (err) {
    if (err.code === 'ENOENT') {
      const defaultData = { analyses: [], complaints: [], users: [] };
      await fs.writeFile(DB_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    throw err;
  }
}

// Helper to save JSON database backup
async function saveDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

/**
 * User Database Operations
 */
export async function getUsers() {
  if (isMongoDBConnected()) {
    try {
      const mongoUsers = await User.find().lean();
      if (mongoUsers && mongoUsers.length > 0) return mongoUsers;
    } catch (err) {
      console.warn('MongoDB getUsers error, using local database fallback:', err.message);
    }
  }
  const dbStore = await loadDB();
  return dbStore.users || [];
}

export async function saveUser(userData) {
  // Save to JSON backup
  const dbStore = await loadDB();
  if (!dbStore.users) dbStore.users = [];
  dbStore.users.push(userData);
  await saveDB(dbStore);

  // Save to MongoDB
  if (isMongoDBConnected()) {
    try {
      await User.create(userData);
    } catch (err) {
      console.warn('MongoDB saveUser error:', err.message);
    }
  }
  return userData;
}

/**
 * Analysis Scan Operations
 */
export async function saveAnalysis(data) {
  const id = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record = { ...data, id, timestamp: new Date().toISOString() };

  // Save to JSON backup
  const dbStore = await loadDB();
  dbStore.analyses.push(record);
  await saveDB(dbStore);

  // Save to MongoDB
  if (isMongoDBConnected()) {
    try {
      await Analysis.create(record);
    } catch (err) {
      console.warn('MongoDB saveAnalysis error:', err.message);
    }
  }
  return id;
}

export async function getAnalyses() {
  if (isMongoDBConnected()) {
    try {
      const mongoAnalyses = await Analysis.find().sort({ timestamp: -1 }).limit(100).lean();
      if (mongoAnalyses && mongoAnalyses.length > 0) return mongoAnalyses;
    } catch (err) {
      console.warn('MongoDB getAnalyses error, using local database fallback:', err.message);
    }
  }
  const dbStore = await loadDB();
  return dbStore.analyses.slice().reverse().slice(0, 100);
}

/**
 * Complaint Operations
 */
export async function saveComplaint(data) {
  const id = `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record = { ...data, id, timestamp: new Date().toISOString() };

  // Save to JSON backup
  const dbStore = await loadDB();
  dbStore.complaints.push(record);
  await saveDB(dbStore);

  // Save to MongoDB
  if (isMongoDBConnected()) {
    try {
      await Complaint.create(record);
    } catch (err) {
      console.warn('MongoDB saveComplaint error:', err.message);
    }
  }
  return id;
}

export async function getComplaints() {
  if (isMongoDBConnected()) {
    try {
      const mongoComplaints = await Complaint.find().sort({ timestamp: -1 }).limit(100).lean();
      if (mongoComplaints && mongoComplaints.length > 0) return mongoComplaints;
    } catch (err) {
      console.warn('MongoDB getComplaints error, using local database fallback:', err.message);
    }
  }
  const dbStore = await loadDB();
  return dbStore.complaints.slice().reverse().slice(0, 100);
}
