import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { ProjectMember } from '../models/ProjectMember';
import { User, IUser } from '../models/User';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import { UserRole } from '../utils/constants';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: IUser & { role?: UserRole };
    }
  }
}

export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '') ||
    req.header('authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new ApiError(401, 'Unauthorized access: No token provided');
  }

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET || 'project_camp_access_secret_2026';
    const decodedToken = jwt.verify(token, secret) as { _id: string };

    const user = await User.findById(decodedToken._id).select(
      '-password -refreshToken -emailVerificationToken -emailVerificationExpiry'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid access token: user not found');
    }

    req.user = user as any;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid access token');
  }
});

export const validateProjectPermission = (allowedRoles: readonly string[] = []) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, 'Project id is missing');
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, 'Invalid project id format');
    }

    if (!req.user?._id) {
      throw new ApiError(401, 'User authentication required');
    }

    const membership = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!membership) {
      throw new ApiError(403, 'You do not have access to this project');
    }

    const givenRole = membership.role;
    if (req.user) {
      req.user.role = givenRole;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(givenRole)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }

    next();
  });
};
