import catchAsync from "../utils/catchAsync";
import {Request, Response, NextFunction} from "express";
import {create, getAll, getById, deleteById, updateById,  getAllPaginated, countAll} from "../service/category.service";
import {CategorySchema} from "../schemas/category.schema";
import {PaginationQuery} from "../schemas/pagination-query.schema";


export const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const data = await getAll();
        return res.status(200).json({
            status: 'success',
            results: data.length,
            data: data
        })
})

export const getAllCategoriesPaginated = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {page, limit} = res.locals.validatedQuery as PaginationQuery;
    const data = await getAllPaginated(page, limit);
    return res.status(200).json({
        status: 'success',
        totalItems: await countAll(),
        totalPages: Math.ceil(data.length / limit),
        currentPage: page,
        limit: limit,
        data: data
    })
})

export const getCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const data = await getById(parseInt(id));
    return res.status(200).json({
        status: 'success',
        data: data
    })
})

export const insertCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data: CategorySchema = req.body;
    const category = await create(data);
    return res.status(201).json({
        status: "success",
        data: category
    })
})

export const updateCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const data: CategorySchema = req.body;
    await getById(parseInt(id));
    const updatedCategory = await updateById(parseInt(id), data);
    return res.status(200).json({
        status: "success",
        data: updatedCategory
    })
})

export const deleteCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await getById(parseInt(req.params.id));
    await deleteById(parseInt(req.params.id));
    return res.status(204).json({
        status: "success",
        data: null
    })
})


