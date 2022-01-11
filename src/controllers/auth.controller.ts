import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import { AuthService } from "../services/auth.service";
import { loginSchema, registroSchema } from "../validations/auth.schema";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  try {
    // Validation
    const { error } = loginSchema.validate(body);
    if (error) {
      return res.status(400).json({
        code: "Bad request",
        message: error,
        status: 400,
      });
    }
    const userRepo = getRepository(User);
    const authService = new AuthService(userRepo);
    const validCredentials = await authService.validCredentials(body);
    if (!validCredentials) {
      return res.status(400).json({
        code: "Bad request",
        message: "Combinacion de credenciales invalidas.",
        status: 400,
      });
    }

    const credentials = await authService.makeToken(body.email);
    return res.status(200).json({
      status: 200,
      message: "Login satisfactorio",
      code: "Success",
      data: credentials,
    });
  } catch (err) {
    console.log("ERROR at login: ", err);
    next(err);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  try {
    // Validation
    const { error } = registroSchema.validate(body);
    if (error) {
      return res.status(400).json({
        code: "Bad request",
        message: error,
        status: 400,
      });
    }
    const userRepo = getRepository(User);
    const authService = new AuthService(userRepo);

    const userExist = await authService.registered(body.email);
    if (userExist) {
      return res.status(400).json({
        code: "Bad request",
        message: "El email ya se encuentra registrado.",
        status: 400,
      });
    }
    const newUser = await authService.register(body);

    return res.status(200).json({
      status: 200,
      message: "Registro satisfactorio",
      code: "Success",
      data: {
        id: newUser.id,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.log("ERROR at login: ", err);
    next(err);
  }
};

export const mySession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRepo = getRepository(User);
    const authService = new AuthService(userRepo);
    const token = req.headers.authorization as string;
    const userSession = await authService.getUser(token || "");
    if (!userSession) {
      return res.status(403).json({
        status: 403,
        message: "Usuario invalido",
        code: "Not allowed",
      });
    }
    return res.status(200).json({ ...userSession, is_logged_in: true });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRepo = getRepository(User);
    const authService = new AuthService(userRepo);
    const token = req.body.refresh as string;
    const userSession = await authService.getUser(token || "");
    if (!userSession) {
      return res.status(403).json({
        status: 403,
        message: "Usuario invalido",
        code: "Not allowed",
      });
    }
    return res.status(200).json({ ...userSession, is_logged_in: true });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  try {
    if (!user) {
      return res.status(403).json({
        status: 403,
        message: "Usuario invalido",
        code: "Not allowed",
      });
    }
    return res.status(200).json({
      is_logged_in: false,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
