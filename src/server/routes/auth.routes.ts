import { Router } from 'express';
import {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  login,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgotPassword,
  verifyEmail,
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validator.middleware';
import {
  forgotPasswordValidator,
  userChangeCurrentPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgotPasswordValidator,
} from '../validators';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.route('/register').post(userRegisterValidator(), validate, registerUser);
router.route('/login').post(userLoginValidator(), validate, login);
router.route('/verify-email/:verificationToken').get(verifyEmail);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/forgot-password').post(forgotPasswordValidator(), validate, forgotPasswordRequest);
router.route('/reset-password/:resetToken').post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

// Protected routes (support both GET and POST for /current-user to satisfy both PRD and REST convention)
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/current-user').get(verifyJWT, getCurrentUser).post(verifyJWT, getCurrentUser);
router.route('/change-password').post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route('/resend-email-verification').post(verifyJWT, resendEmailVerification);

export default router;
