import mongoose from "mongoose";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

export const healthCheck = asyncHandler(async (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: "ok",
        uptime: process.uptime(),
        database: isDbConnected ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
      },
      "System is operational"
    )
  );
});
