import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/api-error';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err: any) => ({
    field: err.path || err.param,
    message: err.msg,
  }));

  const firstMsg = extractedErrors[0]?.message || 'Validation failed';
  throw new ApiError(422, firstMsg, extractedErrors);
};
