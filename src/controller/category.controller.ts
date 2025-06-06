import {Request, Response, NextFunction} from "express";
import {Category} from "@prisma/client";
import catchAsync from "../utils/catchAsync";
import categoryService from "../service/category.service";
import {CategorySchema, PaginationQuery} from "../types/zod-schemas.types";
import {AppError} from "../utils/AppError";
import {
    sendPaginatedResponse,
    sendSuccessArrayResponse,
    sendSuccessResponse
} from "../utils/helpers/response.helpers";


const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as PaginationQuery;
    const data: Category[] = await categoryService.getAll(query);
    if (!query.paginated) {
        return sendSuccessArrayResponse(res, data);
    } else {
        const totalItems = await categoryService.countAll();
        return sendPaginatedResponse(res, data, query, totalItems);
    }
})

const getCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const data: Category | null = await categoryService.getById(parseInt(id));
    if (!data) {
        return next(new AppError("EntityNotFound", `Category with id ${id} not found`));
    }
    return sendSuccessResponse(res, data);
})

const insertCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data: CategorySchema = req.body;
    const category: Category = await categoryService.create(data);
    return sendSuccessResponse(res, category, 201);
})

const updateCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const data: CategorySchema = req.body;
    const category: Category | null = await categoryService.getById(parseInt(id));
    if (!category) {
        return next(new AppError("EntityNotFound", `Category with id ${id} not found`));
    }
    const updatedCategory: Category = await categoryService.updateById(parseInt(id), data);
    return sendSuccessResponse(res, updatedCategory);
})

const deleteCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const category: Category | null = await categoryService.getById(parseInt(id));
    if (!category) {
        return next(new AppError("EntityNotFound", `Category with id ${id} not found`));
    }
    await categoryService.deleteById(parseInt(req.params.id));
    return sendSuccessResponse(res, null, 204);
})

export default {
    getAllCategories,
    getCategoryById,
    insertCategory,
    updateCategoryById,
    deleteCategoryById
}


