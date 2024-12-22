import mongoose from "mongoose";
import { MongoClient } from 'mongodb';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  try {
    if (cached.conn) {
      console.log("Using cached connection");
      return cached.conn;
    }

    // First try to connect with MongoClient to test the connection
    console.log("Testing connection with MongoClient...");
    const client = new MongoClient(process.env.DATABASE_URL!, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    
    await client.connect();
    console.log("MongoClient connected successfully!");
    await client.close();

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true,
        connectTimeoutMS: 10000,
      };

      console.log("Creating new Mongoose connection...");
      mongoose.set('strictQuery', false);
      cached.promise = mongoose.connect(process.env.DATABASE_URL!, opts);
    }

    console.log("Awaiting Mongoose connection...");
    cached.conn = await cached.promise;
    console.log("Successfully connected to MongoDB with Mongoose!");
    return cached.conn;
  } catch (e) {
    console.error("MongoDB Connection Error:", e);
    cached.promise = null;
    throw e;
  }
}
