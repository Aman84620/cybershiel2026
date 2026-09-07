import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cybershield';

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000, // 3s timeout for quick fallback
    });
    isConnected = true;
    console.log(`🍃 MongoDB Connected Successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ MongoDB Connection Notice: Could not connect to (${mongoURI}).`);
    console.warn(`   Falling back to local persistent store database.json.`);
    console.warn(`   Reason: ${error.message}`);
  }
}

export function isMongoDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
