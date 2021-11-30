import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { Post } from "../entity/Post";
import { PostService } from "../services/post.service";
import { postSchema } from "../validations/post.schema";

const MESSAGES = {
  GET: {
    SUCCESS: "Post encontrado exitosamente.",
  },
  GET_MANY: {
    SUCCESS: "Posts encontrados exitosamente.",
  },
  POST: {
    SUCCESS: "Post creado exitosamente.",
    ERROR: "Error creando el Post.",
  },
  UPDATE: {
    SUCCESS: "Post actualizado exitosamente.",
    ERROR: "Error actualizando el Post.",
  },
  DELETE: {
    SUCCESS: "Post eliminado exitosamente.",
  },
};

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page, limit, orderBy, sortBy } = req.query;
  try {
    const postRepo = getRepository(Post);
    const postService = new PostService(postRepo);
    const posts = await postService.getMany(
      parseInt(page as string),
      parseInt(limit as string),
      sortBy as string,
      orderBy as string
    );
    if (!posts) {
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
      data: posts,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};

export const getPostByCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const { page, limit, orderBy, sortBy } = req.query;
  try {
    const postRepo = getRepository(Post);
    const postService = new PostService(postRepo);
    const posts = await postService.getMany(
      parseInt(page as string),
      parseInt(limit as string),
      sortBy as string,
      orderBy as string
    );
    if (!posts) {
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
      data: posts,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};

export const getPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const postRepo = getRepository(Post);
    const postService = new PostService(postRepo);
    const post = await postService.get(parseInt(id));
    if (!post) {
      return res.status(404).json({
        status: 404,
        code: "Not found",
        message: "Post no encontrado",
      });
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.GET.SUCCESS,
      data: post,
    });
  } catch (err) {
    console.log("ERROR:", err);
    next(err);
  }
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  try {
    // Validation
    const { error } = postSchema.validate(body);
    if (error) {
      return res.status(400).json({
        code: "Bad request",
        message: error,
        status: 400,
      });
    }
    const postRepo = getRepository(Post);
    const postService = new PostService(postRepo);
    const post = await postService.create(body);
    if (!post) {
      return res.status(400).json({
        status: 400,
        code: "Bad request",
        message: MESSAGES.POST.ERROR,
      });
    }
    return res.status(201).json({
      status: 201,
      code: "Successful",
      message: MESSAGES.POST.SUCCESS,
      data: post,
    });
  } catch (err) {
    console.log("ERROR:", err);
    next(err);
  }
};

export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const { id } = req.params;
  try {
    const postRepo = getRepository(Post);
    const postService = new PostService(postRepo);
    const postExist = await postService.existe(parseInt(id));
    if (!postExist) {
      return res.status(404).json({
        code: "Not found",
        message: "Post no encontrado.",
        status: 404,
      });
    }
    // Validation
    const { error } = postSchema.validate(body);
    if (error) {
      return res.status(400).json({
        code: "Bad request",
        message: error,
        status: 400,
      });
    }

    const post = await postService.update(parseInt(id), body);
    if (!post) {
      return res.status(400).json({
        status: 400,
        code: "Bad request",
        message: MESSAGES.UPDATE.ERROR,
      });
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.UPDATE.SUCCESS,
      data: post,
    });
  } catch (err) {
    console.log("ERROR:", err);
    next(err);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const postRepo = getRepository(Post);
    const postService = new PostService(postRepo);
    const postExist = await postService.existe(parseInt(id));
    if (!postExist) {
      return res.status(404).json({
        code: "Not found",
        message: "Post no encontrado.",
        status: 404,
      });
    }
    const deleteResult = await postService.delete(parseInt(id));
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

export const searchPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { q } = req.query;
  try {
    const postRepo = getRepository(Post);
    const postService = new PostService(postRepo);
    const posts = await postService.search(q as string);
    if (!posts) {
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
      data: posts,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};
