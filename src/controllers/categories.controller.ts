import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { Category } from "../entity/Category";
import { CategoryService } from "../services/category.service";
import { categorySchema } from "../validations/category.schema";

const MESSAGES = {
  GET: {
    SUCCESS: "Categoria encontrada exitosamente.",
  },
  GET_MANY: {
    SUCCESS: "Categorias encontradas exitosamente.",
  },
  POST: {
    SUCCESS: "Categoria creada exitosamente.",
    ERROR: "Error creando la Categoria.",
  },
  UPDATE: {
    SUCCESS: "Categoria actualizada exitosamente.",
    ERROR: "Error actualizando la Categoria.",
  },
  DELETE: {
    SUCCESS: "Categoria eliminada exitosamente.",
  },
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page, limit, orderBy, sortBy } = req.query;
  try {
    const categoryRepo = getRepository(Category);
    const categoryService = new CategoryService(categoryRepo);
    const categories = await categoryService.getMany(
      parseInt(page as string),
      parseInt(limit as string),
      sortBy as string,
      orderBy as string
    );
    if (!categories) {
      return res.status(200).json({
        status: 200,
        code: "Successful",
        message: MESSAGES.GET_MANY.SUCCESS,
        data: [],
      });
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.GET_MANY.SUCCESS,
      data: categories,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const categoryRepo = getRepository(Category);
    const categoryService = new CategoryService(categoryRepo);
    const category = await categoryService.get(parseInt(id));
    if (!category) {
      return res.status(404).json({
        status: 404,
        code: "Not found",
        message: "Categoria no encontrada",
      });
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.GET.SUCCESS,
      data: category,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  try {
    // Validation
    const { error } = categorySchema.validate(body);
    if (error) {
      return res.status(400).json({
        code: "Bad request",
        message: error,
        status: 400,
      });
    }
    const categoryRepo = getRepository(Category);
    const categoryService = new CategoryService(categoryRepo);
    const category = await categoryService.create(body);
    if (!category) {
      return res.status(404).json({
        status: 400,
        code: "Bad request",
        message: MESSAGES.POST.ERROR,
      });
    }
    return res.status(200).json({
      status: 201,
      code: "Successful",
      message: MESSAGES.POST.SUCCESS,
      data: category,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const { id } = req.params;
  try {
    const categoryRepo = getRepository(Category);
    const categoryService = new CategoryService(categoryRepo);
    const categoryExist = await categoryService.existe(parseInt(id));
    if (!categoryExist) {
      return res.status(404).json({
        code: "Not found",
        message: "Categoria no encontrada.",
        status: 404,
      });
    }
    // Validation
    const { error } = categorySchema.validate(body);
    if (error) {
      return res.status(400).json({
        code: "Bad request",
        message: error,
        status: 400,
      });
    }

    const category = await categoryService.update(parseInt(id), body);
    if (!category) {
      return res.status(404).json({
        status: 400,
        code: "Bad request",
        message: MESSAGES.UPDATE.ERROR,
      });
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.UPDATE.SUCCESS,
      data: category,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const categoryRepo = getRepository(Category);
    const categoryService = new CategoryService(categoryRepo);
    const categoryExist = await categoryService.existe(parseInt(id));
    if (!categoryExist) {
      return res.status(404).json({
        code: "Not found",
        message: "Categoria no encontrada.",
        status: 404,
      });
    }
    const deleteResult = await categoryService.delete(parseInt(id));
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.DELETE.SUCCESS,
      data: deleteResult,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};

export const searchCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { q } = req.query;
  try {
    const categoryRepo = getRepository(Category);
    const categoryService = new CategoryService(categoryRepo);
    const categories = await categoryService.search(q as string);
    if (!categories) {
      return res.status(200).json({
        status: 200,
        code: "Successful",
        message: MESSAGES.GET_MANY.SUCCESS,
        data: [],
      });
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.GET_MANY.SUCCESS,
      data: categories,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};
