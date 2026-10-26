import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from './app';
import { seedInitialData } from './seed';

dotenv.config();

const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 8000);

let mongod: MongoMemoryServer | null = null;

async function connectDatabase(): Promise<string> {
  const customMongoUri = process.env.MONGO_URI;

  if (customMongoUri && !customMongoUri.includes('username:password')) {
    try {
      console.log('Connecting to provided MongoDB URI...');
      await mongoose.connect(customMongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Connected to custom MongoDB successfully.');
      return customMongoUri;
    } catch (err) {
      console.warn('Could not connect to custom MONGO_URI, falling back to embedded MongoMemoryServer:', (err as Error).message);
    }
  }

  console.log('Starting embedded MongoMemoryServer for instant zero-config database...');
  mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'projectcamp',
    },
  });

  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log(`Connected to MongoMemoryServer at ${uri}`);
  return uri;
}

async function startServer() {
  try {
    await connectDatabase();

    // Seed default demo user and expedition project if database is fresh
    await seedInitialData();

    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🏔️  PROJECT CAMP BACKEND SERVER RUNNING`);
      console.log(`🌐  API URL:       http://localhost:${PORT}/api/v1`);
      console.log(`🩺  Health Check:  http://localhost:${PORT}/api/v1/healthcheck`);
      console.log(`🔐  Default Demo:  alex@camp.internal / Expedition2026!`);
      console.log(`======================================================\n`);
    });

    const shutdown = async () => {
      console.log('Shutting down Project Camp backend gracefully...');
      server.close();
      await mongoose.disconnect();
      if (mongod) {
        await mongod.stop();
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
