import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.BACKEND_PORT || (process.env.PORT && process.env.PORT !== "3000" ? process.env.PORT : 8000);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`\n🏔️  Project Camp Node Backend listening on http://localhost:${port}`);
      console.log(`🩺  Health check: http://localhost:${port}/api/v1/healthcheck\n`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
    process.exit(1);
  });
