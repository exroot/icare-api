import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { Profile } from "../entity/Profile";
import { User } from "../entity/User";
import { AuthService } from "../services/auth.service";
import { ProfileService } from "../services/profile.service";
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
        message: "Combinacion de credenciales inválidas.",
        status: 400,
      });
    }

    const credentials = await authService.makeToken(body.email);
    const user = await userRepo.findOne({
      where: { email: body.email },
      relations: ["profile"],
    });
    console.log("USER: ", user);
    return res.status(200).json({
      status: 200,
      message: "Login satisfactorio",
      code: "Success",
      data: {
        username: user ? user.profile.username : "",
        email: user ? user.email : body.email,
        ...credentials,
      },
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
    const { username } = body;
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
    const profileRepo = getRepository(Profile);
    const profileService = new ProfileService(profileRepo);
    const profile = await profileService.existeProfile(username);
    if (profile) {
      return res.status(400).json({
        status: 400,
        code: "Bad request",
        message: "El username ya se encuentra registrado.",
      });
    }

    const newUser = await authService.register(body);
    const newProfile = await profileService.create({
      user_id: newUser.id,
      username,
    });
    await userRepo.update(newUser.id, {
      profile_id: newProfile.id,
    });
    console.log("\n\n\nNEW PROFILEEE: ", newProfile);
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

export const changePassowrd = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { old_password, new_password, email } = req.body;
    const userRepo = getRepository(User);
    const authService = new AuthService(userRepo);
    const validPassword = await authService.validCredentials({
      email: email,
      password: old_password,
    });
    if (!validPassword) {
      return res.status(400).json({
        status: 400,
        message: "Contrasesña antigua inválida.",
        code: "Bad request",
      });
    }
    await authService.changePassword(new_password, email);
    return res.status(200).json({
      status: 200,
      code: "Success",
      data: "Contraseña actualizada satisfactoriamente.",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const disabledAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  const { email } = req.body;
  try {
    const userRepo = getRepository(User);
    const authService = new AuthService(userRepo);
    if (user.email !== email || user.rol_id > 2) {
      return res.status(403).json({
        code: "Unauthorized",
        message: "No tiene los permisos necesarios.",
        status: 403,
      });
    }
    await authService.disableAccount(email);
    return res.status(200).json({
      code: "Success",
      data: "Su cuenta ha sido cerrada.",
      status: 200,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
