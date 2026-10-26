import { body } from 'express-validator';
import { AvailableUserRole } from '../utils/constants';

export const userRegisterValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email is invalid')
      .normalizeEmail(),

    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLowercase()
      .withMessage('Username must be in lower case')
      .isLength({ min: 3 })
      .withMessage('Username must contain at least 3 characters'),

    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must contain at least 6 characters'),

    body('fullName').optional().trim(),
  ];
};

export const userLoginValidator = () => {
  return [
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Email is invalid')
      .normalizeEmail(),

    body('password').notEmpty().withMessage('Password is required'),
  ];
};

export const userChangeCurrentPasswordValidator = () => {
  return [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 6 })
      .withMessage('New password must contain at least 6 characters'),
  ];
};

export const forgotPasswordValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email is invalid')
      .normalizeEmail(),
  ];
};

export const userResetForgotPasswordValidator = () => {
  return [
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 6 })
      .withMessage('New password must contain at least 6 characters'),
  ];
};

export const createProjectValidator = () => {
  return [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().trim(),
  ];
};

export const addMemberToProjectValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email is invalid')
      .normalizeEmail(),
    body('role')
      .notEmpty()
      .withMessage('Role is required')
      .isIn(AvailableUserRole)
      .withMessage(`Role must be one of: ${AvailableUserRole.join(', ')}`),
  ];
};

export const addMembertoProjectValidator = addMemberToProjectValidator;
