import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("❌ MONGO_URI is missing in .env");
  }

  if (!cached.promise) {
    console.log("🔄 Connecting to MongoDB Atlas...");

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // how long to find a reachable server (was 10000)
      connectTimeoutMS: 30000, // initial TCP connection timeout
      socketTimeoutMS: 45000, // drop sockets that stay inactive too long
    };

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((mongooseInstance) => {
        console.log("✅ MongoDB Connected Successfully");
        console.log(`📦 Database: ${mongooseInstance.connection.name}`);
        console.log(`🌍 Host: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ MongoDB Connection Failed");
        console.error(err);
        cached.promise = null; // allow a retry on the next call
        throw err;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
};

export default connectDB;
