import {Request, Response, NextFunction} from "express";
import catchAsync from "../utils/catchAsync";
import categoryService from "../service/category.service";
import {CategorySchema, PaginationQuery} from "../types/zod-schemas.types";
import {AppError} from "../utils/AppError";


const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const data = await categoryService.getAll();
        return res.status(200).json({
            status: 'success',
            results: data.length,
            data: data
        })
})

export const getAllCategoriesPaginated = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = res.locals.validatedQuery as PaginationQuery;
    const data = await categoryService.getAllPaginated(query);
    return res.status(200).json({
        status: 'success',
        totalItems: await categoryService.countAll(),
        totalPages: Math.ceil(data.length / query.limit),
        currentPage: query.page,
        limit: query.limit,
        data: data
    })
})

const getCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const data = await categoryService.getById(parseInt(id));
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
    const category = await categoryService.create(data);
    return res.status(201).json({
        status: "success",
        data: category
    })
})

const updateCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const data: CategorySchema = req.body;
    const category = await categoryService.getById(parseInt(id));
    if (!category) {
        return next(new AppError("EntityNotFound", `Category with id ${id} not found`));
    }
    const updatedCategory = await categoryService.updateById(parseInt(id), data);
    return res.status(200).json({
        status: "success",
        data: updatedCategory
    })
})

const deleteCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const category = await categoryService.getById(parseInt(id));
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
    getAllCategoriesPaginated,
    getCategoryById,
    insertCategory,
    updateCategoryById,
    deleteCategoryById
}


