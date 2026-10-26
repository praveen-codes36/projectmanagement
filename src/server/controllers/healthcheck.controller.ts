import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/async-handler';

export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: 'ok',
        uptime: process.uptime(),
        database: isDbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
      },
      'System is operational'
    )
  );
});
