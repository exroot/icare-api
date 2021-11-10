import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["Authorization"] as string;
    if (!token) {
      return res.status(400).json({
        code: "Bad request",
        message:
          "No se ha encontrado el token de autenticación en los headers.",
        status: 400,
      });
    }
    jwt.verify(
      token as string,
      process.env.JWT_SECRET || "",
      (err, decodedToken) => {
        if (err) {
          return res.status(401).json({
            code: "Unauthorized",
            message: "Token inválido o expirado.",
          });
        }
        req.user = decodedToken;
        next();
      }
    );
  } catch (err) {
    console.log("Error at authenticated middleware. " + err);
    throw err;
  }
};
