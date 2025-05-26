import {Request, Response, NextFunction} from 'express';
import authService from "../service/auth.service";
import catchAsync from '../utils/catchAsync';
import {RegisterDTOSchema, LoginDTOSchema} from "../types/zod-schemas.types";

const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload: LoginDTOSchema = req.body;
    const resp = await authService.loginUser(payload);
    if (resp.status === 'success') {
        return res.status(200).json({
            status: 'success',
            token: resp.data
        })
    } else {
        return res.status(401).json({
            status: 'error',
            message: resp.message
        })
    }
})

const  register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload: RegisterDTOSchema = req.body;
    const resp = await authService.registerUser(payload);
    return res.status(201).json(resp);
})

export default {
    login,
    register
}