import {Request, Response, NextFunction} from "express";
import {Category} from "@prisma/client";
import catchAsync from "../utils/catchAsync";
import categoryService from "../service/category.service";
import {CategorySchema, PaginationQuery} from "../types/zod-schemas.types";
import {AppError} from "../utils/AppError";
import {sendPaginatedCategoriesResponse} from "../utils/helpers/response.helpers";


const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as PaginationQuery;
    if (!query.paginated) {
        const data: Category[] = await categoryService.getAll();
        return res.status(200).json({
            status: 'success',
            results: data.length,
            data: data
        })
    } else {
        const [data, totalItems] = await Promise.all([
            categoryService.getAllPaginated(query),
            categoryService.countAll()
        ])
        return sendPaginatedCategoriesResponse(res, data, query, totalItems);
    }
})

const getCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const data: Category | null = await categoryService.getById(parseInt(id));
    if (!data) {
        return next(new AppError("EntityNotFound", `Category with id ${id} not found`));
    }
    return res.status(200).json({
        status: 'success',
        data: data
    })
})

const insertCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data: CategorySchema = req.body;
    const category: Category = await categoryService.create(data);
    return res.status(201).json({
        status: "success",
        data: category
    })
})

const updateCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const data: CategorySchema = req.body;
    const category: Category | null = await categoryService.getById(parseInt(id));
    if (!category) {
        return next(new AppError("EntityNotFound", `Category with id ${id} not found`));
    }
    const updatedCategory: Category = await categoryService.updateById(parseInt(id), data);
    return res.status(200).json({
        status: "success",
        data: updatedCategory
    })
})

const deleteCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const category: Category | null = await categoryService.getById(parseInt(id));
    if (!category) {
        return next(new AppError("EntityNotFound", `Category with id ${id} not found`));
    }
    await categoryService.deleteById(parseInt(req.params.id));
    return res.status(204).json({
        status: "success",
        data: null
    })
})

export default {
    getAllCategories,
    getCategoryById,
    insertCategory,
    updateCategoryById,
    deleteCategoryById
}


