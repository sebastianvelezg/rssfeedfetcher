// src/lib/mongodb.js
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;

// Modern connection options without deprecated flags
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  w: "majority",
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
};

// Connection management
let client;
let clientPromise;

// Create a global MongoDB connection promise for development
if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve the connection across HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client
      .connect()
      .then((client) => {
        console.log("MongoDB connected successfully (Development)");
        return client;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        throw error;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new connection for each instance
  client = new MongoClient(uri, options);
  clientPromise = client
    .connect()
    .then((client) => {
      console.log("MongoDB connected successfully (Production)");
      return client;
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
      throw error;
    });
}

// Helper function to check connection status
export async function checkConnection() {
  try {
    const client = await clientPromise;
    await client.db().command({ ping: 1 });
    return true;
  } catch (error) {
    console.error("MongoDB connection check failed:", error);
    return false;
  }
}

// Helper function to get a database instance
export async function getDb(dbName = "rssApp") {
  const client = await clientPromise;
  return client.db(dbName);
}

// Export the clientPromise
export default clientPromise;

// Export a helper function to safely close the connection
export async function closeConnection() {
  try {
    const client = await clientPromise;
    await client.close();
    console.log("MongoDB connection closed successfully");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    throw error;
  }
}
