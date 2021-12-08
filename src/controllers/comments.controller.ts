import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { Comment } from "../entity/Comment";
import { CommentService } from "../services/comment.service";
import { commentSchema } from "../validations/comment.schema";

const MESSAGES = {
  GET: {
    SUCCESS: "Comentario encontrado exitosamente.",
  },
  GET_MANY: {
    SUCCESS: "Comentarios encontrados exitosamente.",
  },
  POST: {
    SUCCESS: "Comentario creado exitosamente.",
    ERROR: "Error creando el comentario.",
  },
  UPDATE: {
    SUCCESS: "Comentario actualizado exitosamente.",
    ERROR: "Error actualizando el comentario.",
  },
  DELETE: {
    SUCCESS: "Comentario eliminado exitosamente.",
  },
};

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page, limit, orderBy, sortBy } = req.query;
  try {
    const commentRepo = getRepository(Comment);
    const commentService = new CommentService(commentRepo);
    const comments = await commentService.getMany(
      parseInt(page as string),
      parseInt(limit as string),
      sortBy as string,
      orderBy as string
    );
    if (!comments) {
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
      data: comments,
    });
  } catch (err) {
    console.log("ERROR at login: ", err);
    next(err);
  }
};

export const getCommentsByPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page, limit, orderBy, sortBy, postId } = req.query;
  try {
    const commentRepo = getRepository(Comment);
    const commentService = new CommentService(commentRepo);
    const comments = await commentService.getCommentsByPostId(
      parseInt(postId as string),
      parseInt(page as string),
      parseInt(limit as string),
      sortBy as string,
      orderBy as string
    );
    if (!comments) {
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
      data: comments,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const { user } = req;
  try {
    const { error } = commentSchema.validate({ ...body, user_id: user.id });
    if (error) {
      return res.status(400).json({
        code: "Bad request",
        message: error,
        status: 400,
      });
    }
    const commentRepo = getRepository(Comment);
    const commentService = new CommentService(commentRepo);
    const comment = await commentService.create({ ...body, user_id: user.id });
    if (!comment) {
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
      data: comment,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const { id } = req.params;
  const { user } = req;
  try {
    const commentRepo = getRepository(Comment);
    const commentService = new CommentService(commentRepo);
    const commentExist = await commentService.existe(parseInt(id));
    if (!commentExist) {
      return res.status(404).json({
        code: "Not found",
        message: "Comentario no encontrado.",
        status: 404,
      });
    }
    // Validation
    const { error } = commentSchema.validate({ ...body, user_id: user.id });
    if (error) {
      return res.status(400).json({
        code: "Bad request",
        message: error,
        status: 400,
      });
    }

    const comment = await commentService.update(parseInt(id), {
      ...body,
      user_id: user.id,
    });
    if (!comment) {
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
      data: comment,
    });
  } catch (err) {
    console.log("ERROR at login: ", err);
    next(err);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const commentRepo = getRepository(Comment);
    const commentService = new CommentService(commentRepo);
    const commentExist = await commentService.existe(parseInt(id));
    if (!commentExist) {
      return res.status(404).json({
        code: "Not found",
        message: "Comentario no encontrado.",
        status: 404,
      });
    }
    const deleteResult = await commentService.delete(parseInt(id));
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
