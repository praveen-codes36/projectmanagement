import mongoose from "mongoose";

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri && !uri.includes("username:password")) {
    try {
      console.log("Connecting to custom MongoDB...");
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("MongoDB Connected successfully");
      return uri;
    } catch (error) {
      console.warn("Could not connect to custom MONGO_URI, falling back to embedded MongoMemoryServer:", error.message);
    }
  }

  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    console.log("Starting embedded MongoMemoryServer for instant backend testing...");
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: "projectcamp",
      },
    });
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`Connected to MongoMemoryServer at ${memoryUri}`);
    return memoryUri;
  } catch (error) {
    console.error("Failed to connect to MongoDB or MongoMemoryServer:", error);
    process.exit(1);
  }
};

export default connectDB;