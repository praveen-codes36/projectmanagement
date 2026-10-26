import { validationResult } from "express-validator";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";


export const validate = (req,res,next)=>{
    const errors = validationResult(req)

    if(errors.isEmpty()){
        return next();
    }

    const extractedErrors = [];
    errors.array().map((err)=> extractedErrors.push(
        {
            [err.path]: err.msg
    }));
    throw new APIError(422,"Recieved data is not valid",extractedErrors);
};