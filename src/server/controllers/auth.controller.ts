import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { ApiResponse } from '../utils/api-response';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from '../utils/mail';

const generateAccessAndRefreshTokens = async (userId: string | any) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Something went wrong while generating authentication tokens.');
  }
};

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password, fullName } = req.body;

  if (!email || !password || !username) {
    throw new ApiError(400, 'Email, username, and password are required');
  }

  const existingUser = await User.findOne({
    $or: [{ username: username.toLowerCase().trim() }, { email: email.toLowerCase().trim() }],
  });

  if (existingUser) {
    throw new ApiError(409, 'User with this email or username already exists');
  }

  const user = await User.create({
    email: email.toLowerCase().trim(),
    password,
    username: username.toLowerCase().trim(),
    fullName: fullName || username,
    isEmailVerified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = new Date(tokenExpiry);
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${unHashedToken}`;

  // Send verification email in background without blocking registration
  sendEmail({
    email: user.email,
    subject: 'Please verify your email address',
    mailgenContent: emailVerificationMailgenContent(user.username, verificationUrl),
  }).catch(() => {});

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgetPasswordToken -forgetPasswordExpiry'
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: createdUser },
      'User registered successfully. A verification email has been sent.'
    )
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, 'Email or username is required');
  }

  if (!password) {
    throw new ApiError(400, 'Password is required');
  }

  const user = await User.findOne({
    $or: [
      ...(email ? [{ email: email.toLowerCase().trim() }] : []),
      ...(username ? [{ username: username.toLowerCase().trim() }] : []),
    ],
  });

  if (!user) {
    throw new ApiError(400, 'Invalid credentials');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, 'Invalid credentials');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgetPasswordToken -forgetPasswordExpiry'
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'User logged in successfully'
      )
    );
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: '',
        },
      },
      { new: true }
    );
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized access');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, 'Current user fetched successfully'));
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError(400, 'Email verification token is missing.');
  }

  const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, 'Verification token is invalid or has expired.');
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      { isEmailVerified: true },
      'Email address has been successfully verified.'
    )
  );
});

export const resendEmailVerification = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, 'User does not exist');
  }

  if (user.isEmailVerified) {
    throw new ApiError(409, 'Email address is already verified');
  }

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = new Date(tokenExpiry);
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${unHashedToken}`;

  sendEmail({
    email: user.email,
    subject: 'Please verify your email address',
    mailgenContent: emailVerificationMailgenContent(user.username, verificationUrl),
  }).catch(() => {});

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Verification email has been sent to your email address'));
});

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized access: Refresh token missing');
  }

  try {
    const secret = process.env.REFRESH_TOKEN_SECRET || 'project_camp_refresh_secret_2026';
    const decodedToken = jwt.verify(incomingRefreshToken, secret) as { _id: string };

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token: user not found');
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, 'Refresh token has expired or been revoked');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 10 * 24 * 60 * 60 * 1000,
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          'Access token refreshed successfully'
        )
      );
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
});

export const forgotPasswordRequest = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    // For privacy, don't confirm or deny user existence; return generic success
    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        'If an account with that email exists, a password reset link has been sent.'
      )
    );
  }

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.forgetPasswordToken = hashedToken;
  user.forgetPasswordExpiry = new Date(tokenExpiry);
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${
    process.env.FORGOT_PASSWORD_REDIRECT_URL || 'http://localhost:3000/reset-password'
  }/${unHashedToken}`;

  sendEmail({
    email: user.email,
    subject: 'Password reset request',
    mailgenContent: forgotPasswordMailgenContent(user.username, resetUrl),
  }).catch(() => {});

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      'Password reset instructions have been sent to your email.'
    )
  );
});

export const resetForgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  if (!resetToken) {
    throw new ApiError(400, 'Reset token is required');
  }

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'New password must contain at least 6 characters');
  }

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    forgetPasswordToken: hashedToken,
    forgetPasswordExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, 'Password reset token is invalid or has expired.');
  }

  user.forgetPasswordExpiry = undefined;
  user.forgetPasswordToken = undefined;
  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password has been reset successfully. You may now log in.'));
});

export const changeCurrentPassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'Both old password and new password are required');
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, 'Incorrect old password');
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));
});
