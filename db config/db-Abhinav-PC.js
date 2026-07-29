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

    console.log("🔄 Connecting to MongoDB Atlas...");

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
        };

        cached.promise = mongoose
            .connect(process.env.MONGO_URI, opts)
            .then((mongooseInstance) => {
                console.log("✅ MongoDB Connected Successfully");
                console.log(
                    `📦 Database: ${mongooseInstance.connection.name}`
                );
                console.log(
                    `🌍 Host: ${mongooseInstance.connection.host}`
                );

                return mongooseInstance;
            })
            .catch((err) => {
                console.error("❌ MongoDB Connection Failed");
                console.error(err);
                throw err;
            });
    }

    cached.conn = await cached.promise;

    return cached.conn;
};

export default connectDB;